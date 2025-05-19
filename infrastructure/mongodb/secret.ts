import * as aws from "@pulumi/aws";
import * as config from "../configuration/config";

const mongoAdminPassword = new aws.secretsmanager.Secret("mongoAdminPassword", {
  name: "mongoAdminPassword",
});

new aws.secretsmanager.SecretVersion("mongoAdminPasswordSecretVersion", {
  secretId: mongoAdminPassword.id,
  secretString: config.mongoDb.adminPassword,
});

export const mongoAdminPasswordId = mongoAdminPassword.id;
