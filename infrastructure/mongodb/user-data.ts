import * as pulumi from "@pulumi/pulumi";
import * as config from "../configuration/config";
import { mongoAdminPasswordId } from "./secret";

const awsRegion = config.aws.region;
const awsMongoAdminPasswordId = mongoAdminPasswordId;
export const userData = pulumi.interpolate`#!/bin/bash

# install dependencies
apt-get update -y
apt-get install -y libcurl4 openssl liblzma5 curl awscli gnupg tar

# install mongo db
curl -sLO ${config.mongoDb.downloadUrl}
tar -xzf ${config.mongoDb.tgz} 
mv ${config.mongoDb.fileName} /opt/mongodb
ln -s /opt/mongodb/bin/* /usr/local/bin/

# install mongosh
curl -sLO ${config.mongosh.downloadUrl}
tar -xzf ${config.mongosh.tgz}
mv ${config.mongosh.fileName} /opt/mongosh
ln -s /opt/mongosh/bin/* /usr/local/bin/

# install mongo db tools
curl -sLO ${config.mongoDbTools.downloadUrl}
tar -xzf ${config.mongoDbTools.tgz}
mv ${config.mongoDbTools.fileName} /opt/mongodb-tools
ln -s /opt/mongodb-tools/bin/* /usr/local/bin/

# Create backup script
cat << 'EOF' > /opt/mongo-backup.sh
#!/bin/bash
TIMESTAMP=\$(date +%F-%H%M)
BACKUP_DIR="/tmp/mongo-backup-\$TIMESTAMP"
ARCHIVE_FILE="/tmp/mongo-backup-\$TIMESTAMP.tar.gz"
S3_BUCKET="${config.s3.bucketName}"
S3_KEY="backups/mongo-\$TIMESTAMP.tar.gz"
ADMIN_PASSWORD=\$(aws secretsmanager get-secret-value --secret-id ${awsMongoAdminPasswordId} --query SecretString --output text --region ${awsRegion})

mkdir -p "\$BACKUP_DIR"
mongodump --uri="mongodb://${config.mongoDb.adminUser}:\$ADMIN_PASSWORD@localhost:27017/?authSource=admin" --out="\$BACKUP_DIR"
tar -czf "\$ARCHIVE_FILE" -C "\$BACKUP_DIR" .
aws s3 cp "\$ARCHIVE_FILE" "s3://\$S3_BUCKET/\$S3_KEY"
rm -rf "\$BACKUP_DIR" "\$ARCHIVE_FILE"
EOF

# make the backup script executable
chmod +x /opt/mongo-backup.sh

# Set up cron to run daily at 2am
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/mongo-backup.sh >> /var/log/mongo_s3_backup.log 2>&1") | crontab -

# create the directories
mkdir -p /var/lib/mongo
mkdir -p /var/log/mongodb

# start the mongo db service
mongod --dbpath ${config.mongoDb.dbDataPath} --logpath ${config.mongoDb.logFilePath} --fork

# wait for mongod to start
for i in {1..10}; do
  nc -z localhost 27017 && break
  sleep 2
done

# create admin user
mongosh <<EOF
use admin   
if (db.system.users.countDocuments({ user: "${config.mongoDb.adminUser}" }) === 0) {
  db.createUser({
    user: "${config.mongoDb.adminUser}",
    pwd: "${config.mongoDb.adminPassword}",
    roles: [ { role: "root", db: "admin" } ]
  });
}
EOF

# stop mongod (cleanly)
pkill mongod
sleep 2

# create mongod.conf with authentication
cat <<EOF > /etc/mongod.conf
storage:
  dbPath: ${config.mongoDb.dbDataPath}
systemLog:
  destination: file
  path: ${config.mongoDb.logFilePath}
  logAppend: true
net:
  bindIp: 0.0.0.0
  port: 27017
security:
  authorization: enabled
EOF

# start mongod with auth enabled
mongod --config /etc/mongod.conf --fork
`;
