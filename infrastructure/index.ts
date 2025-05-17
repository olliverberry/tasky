import { mongo } from "./mongodb/mongo";
import { eksCluster } from "./k8s/eks";
import * as s3 from "./s3/s3";
import * as k8s from "./k8s/apps/server";

export const mongoPublicDns = mongo.publicDns;
export const k8sConfig = eksCluster.kubeconfigJson;
export const k8sClusterName = eksCluster.eksCluster.name;
export const apiServerUrl = eksCluster.eksCluster.endpoint;
export const s3Url = s3.s3Url;
export const appNamespace = k8s.appNamespace;
export const appAdminSa = k8s.appAdminSa;
