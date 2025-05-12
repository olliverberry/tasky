import * as pulumi from "@pulumi/pulumi";

const infraStack = new pulumi.StackReference("smehrens/infrastructure/dev");

const k8sConfig = infraStack.getOutput("k8sConfig").apply((k8s) => `${k8s}`);
const k8sNamespace = "apps";
export const k8s = {
  config: k8sConfig,
  namespace: k8sNamespace,
};

const mongoHostName = infraStack
  .getOutput("mongoHostName")
  .apply((hostName) => `${hostName}`);
const mongoAdminUser = pulumi.output("adminUser");
const mongoAdminPassword = pulumi.output(
  process.env.MONGO_ADMIN_PASSWORD || ""
);

const mongoUri = pulumi.interpolate`mongodb://${mongoAdminUser}:${mongoAdminPassword}@${mongoHostName}:27017/?authSource=admin`;

export const mongo = {
  uri: mongoUri,
  secretKey: process.env.SECRET_KEY || "",
};
