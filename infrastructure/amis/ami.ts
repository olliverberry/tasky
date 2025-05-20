import * as aws from "@pulumi/aws";
import * as config from "../configuration/config";

export const mongoGoldenAmi = new aws.ec2.AmiCopy("golden-copy", {
  name: `${config.resourcePrefix}-${config.aws.region}-golden-ami`,
  description: "Golden AMI for MongoDB",
  sourceAmiId: config.mongoEc2.amiId,
  sourceAmiRegion: config.aws.region!,
  tags: {
    ApprovedAmi: "True",
  },
});
