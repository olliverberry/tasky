import * as aws from "@pulumi/aws";
import * as config from "./config";

const mongoEc2Policy: aws.iam.PolicyDocument = {
  Version: "2012-10-17",
  Statement: [
    {
      Action: "sts:AssumeRole",
      Principal: {
        Service: "ec2.amazonaws.com",
      },
      Effect: "Allow",
    },
  ],
};

const mongoEc2Role = new aws.iam.Role(
  `${config.resourcePrefix}-mongo-ec2-role`,
  {
    name: `${config.resourcePrefix}-mongo-ec2-role`,
    assumeRolePolicy: mongoEc2Policy,
    managedPolicyArns: [aws.iam.ManagedPolicies.AdministratorAccess],
  }
);

const mongoEc2InstanceProfile = new aws.iam.InstanceProfile(
  `${config.resourcePrefix}-mongo-ec2-instance-profile`,
  {
    name: `${config.resourcePrefix}-mongo-ec2-instance-profile`,
    role: mongoEc2Role.name,
  }
);

export const mongoEc2InstanceProfileName = mongoEc2InstanceProfile.name;
