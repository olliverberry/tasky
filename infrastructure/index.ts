import * as pulumi from "@pulumi/pulumi";
import { mongo } from "./mongodb/mongo";
import { eksCluster } from "./eks";

export const mongoIp = mongo.publicIp;
export const mongoHostName = mongo.publicDns;
export const mongoBaseUrl = pulumi.interpolate`http://${mongo.publicDns}`;
export const k8sConfig = eksCluster.kubeconfigJson;
