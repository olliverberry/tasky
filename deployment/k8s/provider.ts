import * as kubernetes from "@pulumi/kubernetes";
import * as config from "../configuration/config";

export const provider = new kubernetes.Provider("eks-provider", {
  kubeconfig: config.k8s.config,
});
