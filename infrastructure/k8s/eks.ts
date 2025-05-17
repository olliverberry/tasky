import * as eks from "@pulumi/eks";
import * as network from "../networking/network";
import * as config from "../configuration/config";

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
    nodeAssociatePublicIpAddress: false,
  },
  enabledClusterLogTypes: [
    "api",
    "audit",
    "authenticator",
    "controllerManager",
    "scheduler",
  ],
});

export const eksCluster = cluster;
