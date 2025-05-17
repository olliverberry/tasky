import * as pulumi from "@pulumi/pulumi";

const infraStack = new pulumi.StackReference(
  process.env.INFRA_STACK_NAME || ""
);

const k8sConfig = infraStack.getOutput("k8sConfig").apply((k8s) => `${k8s}`);
export const k8s = {
  config: k8sConfig,
  namespace: infraStack.getOutput("appNamespace"),
  adminSa: infraStack.getOutput("appAdminSa"),
  imageTag: process.env.IMAGE_TAG || "latest",
  dockerRegistry: process.env.DOCKER_REGISTRY || "ghcr.io/olliverberry",
  imageName: process.env.IMAGE_NAME || "tasky",
};

const mongoPublicDns = infraStack
  .getOutput("mongoPublicDns")
  .apply((dns) => `${dns}`);
const mongoAdminUser = pulumi.output("adminUser");
const mongoAdminPassword = pulumi.output(
  process.env.MONGO_ADMIN_PASSWORD || ""
);

const mongoUri = pulumi.interpolate`mongodb://${mongoAdminUser}:${mongoAdminPassword}@${mongoPublicDns}:27017/?authSource=admin`;
export const mongo = {
  uri: mongoUri,
  secretKey: process.env.SECRET_KEY || "",
};
