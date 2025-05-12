import * as aws from "@pulumi/aws";
import * as config from "../config";
import { userData } from "./user-data";
import {
  mongoSecGroupIngressId,
  mongoSubnetId,
  outBoundSecGroupId,
  sshSecGroupId,
} from "../network";
import { mongoEc2InstanceProfileName } from "../iam";
import { getAvailableAzs } from "../utils/availability-zones";

const ami = aws.ec2
  .getAmi({
    filters: [
      {
        name: "image-id",
        values: [config.mongoEc2.amiId],
      },
    ],
    owners: ["amazon"],
    mostRecent: true,
  })
  .then((invoke) => invoke.id);

const keyPair = new aws.ec2.KeyPair(`${config.resourcePrefix}-key-pair`, {
  keyName: `${config.resourcePrefix}-key-pair`,
  publicKey: config.mongoEc2.publicKey || "",
});

const azs = getAvailableAzs();
const mongo = new aws.ec2.Instance(`${config.resourcePrefix}-mongo`, {
  instanceType: config.mongoEc2.instanceType,
  subnetId: mongoSubnetId,
  vpcSecurityGroupIds: [
    outBoundSecGroupId,
    sshSecGroupId,
    mongoSecGroupIngressId,
  ],
  keyName: keyPair.keyName,
  userData: userData,
  userDataReplaceOnChange: true,
  ami: ami,
  tags: {
    Name: `${config.resourcePrefix}-mongo`,
  },
  availabilityZone: azs.then((az) => az.names[0]),
  iamInstanceProfile: mongoEc2InstanceProfileName,
});

export { mongo };
