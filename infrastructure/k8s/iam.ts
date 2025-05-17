import * as aws from "@pulumi/aws";
import { eksCluster } from "./eks";
import * as config from "../configuration/config";

const adminAccess = new aws.eks.AccessEntry("adminAccess", {
  clusterName: eksCluster.core.cluster.name,
  principalArn: config.kubernetes.adminRoleArn!,
  type: "STANDARD",
});

const adminAccessPolicy = new aws.eks.AccessPolicyAssociation(
  "adminAccessPolicy",
  {
    clusterName: eksCluster.core.cluster.name,
    principalArn: config.kubernetes.adminRoleArn!,
    accessScope: {
      type: "cluster",
    },
    policyArn: config.kubernetes.adminPolicyArn!,
  }
);

export { adminAccess, adminAccessPolicy };
