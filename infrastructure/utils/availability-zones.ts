import * as aws from "@pulumi/aws";

export const getAvailableAzs = () => {
  return aws.getAvailabilityZones({
    state: "available",
  });
};
