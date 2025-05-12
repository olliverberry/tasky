import * as pulumi from "@pulumi/pulumi";
import { mongo } from "./mongodb/mongo";
import { eksCluster } from "./eks";
import * as s3 from "./s3";

export const mongoIp = mongo.publicIp;
export const mongoHostName = mongo.publicDns;
export const mongoBaseUrl = pulumi.interpolate`http://${mongo.publicDns}`;
export const k8sConfig = eksCluster.kubeconfigJson;
export const k8sClusterName = eksCluster.eksCluster.name;
export const s3Url = s3.s3Url;
