import * as eks from "@pulumi/eks";
import * as network from "./network";
import * as config from "./config";

const cluster = new eks.Cluster(`${config.resourcePrefix}-cluster`, {
  name: `${config.resourcePrefix}-cluster`,
  vpcId: network.vpcId,
  authenticationMode: eks.AuthenticationMode.Api,
  privateSubnetIds: network.privateKubernetesSubnetIds,
  publicSubnetIds: network.publicKubernetesSubnetIds,
  nodeGroupOptions: {
    extraNodeSecurityGroups: [network.kubernetsSecGroup],
    maxSize: 2,
    minSize: 1,
  },
});

export const eksCluster = cluster;
