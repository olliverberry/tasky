import * as pulumi from "@pulumi/pulumi";

const defaultConfig = new pulumi.Config();
const mongoDbFileName = "mongodb-linux-x86_64-ubuntu1804-5.0.30";
const mongoshFileName = "mongosh-2.2.5-linux-x64";
const mongoDbTgz = `${mongoDbFileName}.tgz`;
const mongoshTgz = `${mongoshFileName}.tgz`;
const mongoDbToolsFileName =
  "mongodb-database-tools-ubuntu1804-x86_64-100.12.0";
const mongoDbToolsTgz = `${mongoDbToolsFileName}.tgz`;

export const mongoDbTools = {
  fileName: mongoDbToolsFileName,
  tgz: mongoDbToolsTgz,
  downloadUrl:
    defaultConfig.get("mongoDbToolsDownloadUrl") ||
    `https://fastdl.mongodb.org/tools/db/${mongoDbToolsTgz}`,
};

export const mongosh = {
  fileName: mongoshFileName,
  tgz: mongoshTgz,
  downloadUrl:
    defaultConfig.get("mongoshDownloadUrl") ||
    `https://downloads.mongodb.com/compass/${mongoshTgz}`,
};

export const mongoDb = {
  fileName: mongoDbFileName,
  tgz: mongoDbTgz,
  downloadUrl:
    defaultConfig.get("mongoDbDownloadUrl") ||
    `https://fastdl.mongodb.org/linux/${mongoDbTgz}`,
  adminUser: defaultConfig.get("adminUser") || "adminUser",
  adminPassword:
    defaultConfig.get("adminPassword") || process.env.ADMIN_PASSWORD,
  logFilePath:
    defaultConfig.get("logFilePath") || "/var/log/mongodb/mongod.log",
  dbDataPath: defaultConfig.get("dbDataPath") || "/var/lib/mongo",
};

export const mongoEc2 = {
  instanceType: defaultConfig.get("mongoInstanceType") || "t3.micro",
  amiId: defaultConfig.get("mongoAmiId") || "ami-055744c75048d8296",
  publicKey: defaultConfig.get("publicKey") || process.env.PUBLIC_KEY,
};

export const vpc = {
  networkCidr: defaultConfig.get("vpcNetworkCidr") || "10.0.0.0/16",
};

export const kubernetes = {
  instanceType: defaultConfig.get("kubernetesInstanceType") || "t3.medium",
  adminRoleArn:
    defaultConfig.get("adminRoleArn") || process.env.AWS_ADMIN_ROLE_ARN,
  adminPolicyArn:
    defaultConfig.get("adminPolicyArn") ||
    "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy",
  apps: {
    server: {
      namespace: defaultConfig.get("kubernetesServerNamespace") || "apps",
    },
  },
};

export const resourcePrefix =
  defaultConfig.get("resourcePrefix") || "wiz-challenge";

export const s3 = {
  bucketName: defaultConfig.get("s3BucketName") || `${resourcePrefix}-backup`,
};

export const aws = {
  region: process.env.AWS_REGION,
};
