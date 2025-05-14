import * as kubernetes from "@pulumi/kubernetes";
import * as config from "./config";
import { provider } from "./provider";

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
          serviceAccountName: config.k8s.adminSa,
          containers: [
            {
              name: "server",
              image: `${config.k8s.dockerRegistry}/tasky:${config.k8s.imageTag}`,
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
