import * as aws from "@pulumi/aws";
import * as config from "../configuration/config";
import * as pulumi from "@pulumi/pulumi";

const mongoDbBackupBucket = new aws.s3.Bucket(
  `${config.resourcePrefix}-backup`,
  {
    bucket: config.s3.bucketName,
    forceDestroy: true,
  }
);

const publicAccessBlock = new aws.s3.BucketPublicAccessBlock(
  `${config.resourcePrefix}-backup-public-access`,
  {
    bucket: mongoDbBackupBucket.id,
    blockPublicAcls: false,
    blockPublicPolicy: false,
    ignorePublicAcls: false,
    restrictPublicBuckets: false,
  }
);

const backupBucketPolicyDoc: aws.iam.PolicyDocument = {
  Version: "2012-10-17",
  Statement: [
    {
      Sid: "PublicReadGetObject",
      Effect: "Allow",
      Principal: "*",
      Action: ["s3:GetObject", "s3:ListBucket"],
      Resource: [
        mongoDbBackupBucket.arn,
        pulumi.interpolate`${mongoDbBackupBucket.arn}/*`,
      ],
    },
  ],
};

new aws.s3.BucketPolicy(
  `${config.resourcePrefix}-backup-bucket-policy`,
  {
    bucket: mongoDbBackupBucket.id,
    policy: backupBucketPolicyDoc,
  },
  { dependsOn: [publicAccessBlock] }
);

export const s3Url = pulumi.interpolate`https://${mongoDbBackupBucket.bucket}.s3.amazonaws.com`;
