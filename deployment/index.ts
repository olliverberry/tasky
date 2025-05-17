import { serverServiceHostName } from "./k8s/apps/server";

export const serverServiceUrl = serverServiceHostName.apply(
  (hostname) => `http://${hostname}`
);
