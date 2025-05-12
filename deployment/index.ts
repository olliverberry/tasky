import * as kubernetes from "@pulumi/kubernetes";
import * as config from "./config";
import { provider } from "./provider";

const k8sNamespace = new kubernetes.core.v1.Namespace(
  config.k8s.namespace,
  {
    metadata: {
      name: config.k8s.namespace,
    },
  },
  { provider }
);

const adminSa = new kubernetes.core.v1.ServiceAccount(
  "admin-sa",
  {
    metadata: {
      name: "admin-sa",
      namespace: config.k8s.namespace,
    },
  },
  { provider }
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
        namespace: config.k8s.namespace,
      },
    ],
  },
  { provider }
);

const serverDeployment = new kubernetes.apps.v1.Deployment(
  "server-deployment",
  {
    metadata: {
      labels: {
        appClass: "server",
      },
      namespace: config.k8s.namespace,
    },
    spec: {
      replicas: 2,
      selector: {
        matchLabels: {
          appClass: "server",
        },
      },
      template: {
        metadata: {
          labels: {
            appClass: "server",
          },
        },
        spec: {
          serviceAccountName: adminSa.metadata.name,
          containers: [
            {
              name: "server",
              image: `ghcr.io/smehrens/tasky:${config.k8s.imageTag}`,
              imagePullPolicy: "Always",
              ports: [
                {
                  name: "http",
                  containerPort: 8080,
                },
              ],
              env: [
                {
                  name: "MONGODB_URI",
                  value: config.mongo.uri,
                },
                {
                  name: "SECRET_KEY",
                  value: config.mongo.secretKey,
                },
              ],
            },
          ],
        },
      },
    },
  },
  {
    provider: provider,
  }
);

const serverService = new kubernetes.core.v1.Service(
  "server-service",
  {
    metadata: {
      labels: {
        appClass: "server",
      },
      namespace: config.k8s.namespace,
    },
    spec: {
      type: "LoadBalancer",
      ports: [
        {
          port: 80,
          targetPort: "http",
        },
      ],
      selector: {
        appClass: "server",
      },
    },
  },
  {
    provider: provider,
  }
);

export const serviceUrl =
  serverService.status.loadBalancer.ingress[0].hostname.apply(
    (hostname) => `http://${hostname}`
  );
