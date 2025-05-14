import * as kubernetes from "@pulumi/kubernetes";
import * as config from "../../config";
import { eksCluster } from "../eks";

const k8sNamespace = new kubernetes.core.v1.Namespace(
  config.kubernetes.apps.server.namespace,
  {
    metadata: {
      name: config.kubernetes.apps.server.namespace,
    },
  },
  { provider: eksCluster.provider }
);

const adminSa = new kubernetes.core.v1.ServiceAccount(
  "admin-sa",
  {
    metadata: {
      name: "admin-sa",
      namespace: k8sNamespace.metadata.name,
    },
  },
  { provider: eksCluster.provider }
);

const clusterRoleBinding = new kubernetes.rbac.v1.ClusterRoleBinding(
  "admin-binding",
  {
    metadata: {
      name: "admin-binding",
    },
    roleRef: {
      apiGroup: "rbac.authorization.k8s.io",
      kind: "ClusterRole",
      name: "cluster-admin",
    },
    subjects: [
      {
        kind: "ServiceAccount",
        name: adminSa.metadata.name,
        namespace: k8sNamespace.metadata.name,
      },
    ],
  },
  { provider: eksCluster.provider }
);

export const appNamespace = k8sNamespace.metadata.name;
export const appAdminSa = adminSa.metadata.name;
