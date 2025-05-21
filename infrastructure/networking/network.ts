import * as aws from "@pulumi/aws";
import * as config from "../configuration/config";
import { getAvailableAzs } from "../utils/availability-zones";

const vpc = new aws.ec2.Vpc(`${config.resourcePrefix}-vpc`, {
  cidrBlock: config.vpc.networkCidr,
  enableDnsHostnames: true,
  enableDnsSupport: true,
  tags: {
    Name: `${config.resourcePrefix}-vpc`,
  },
});

const gateway = new aws.ec2.InternetGateway(
  `${config.resourcePrefix}-gateway`,
  {
    vpcId: vpc.id,
    tags: {
      Name: `${config.resourcePrefix}-gateway`,
    },
  }
);

const azs = getAvailableAzs();
const mongoSubnet = new aws.ec2.Subnet(
  `${config.resourcePrefix}-mongodb-subnet`,
  {
    vpcId: vpc.id,
    cidrBlock: "10.0.1.0/24",
    mapPublicIpOnLaunch: true,
    availabilityZone: azs.then((az) => az.names[0]),
    tags: {
      Name: `${config.resourcePrefix}-mongodb-subnet`,
      Public: "true",
    },
  }
);

const privateK8sSubnet1 = new aws.ec2.Subnet(
  `${config.resourcePrefix}-kubernetes-subnet-1`,
  {
    vpcId: vpc.id,
    cidrBlock: "10.0.2.0/24",
    mapPublicIpOnLaunch: false,
    availabilityZone: azs.then((az) => az.names[0]),
    tags: {
      Name: `${config.resourcePrefix}-kubernetes-subnet-1`,
      Public: "false",
    },
  }
);

const privateK8sSubnet2 = new aws.ec2.Subnet(
  `${config.resourcePrefix}-kubernetes-subnet-2`,
  {
    vpcId: vpc.id,
    cidrBlock: "10.0.3.0/24",
    mapPublicIpOnLaunch: false,
    availabilityZone: azs.then((az) => az.names[1]),
    tags: {
      Name: `${config.resourcePrefix}-kubernetes-subnet-2`,
      Public: "false",
    },
  }
);

const publicK8sSubnet1 = new aws.ec2.Subnet(
  `${config.resourcePrefix}-public-kubernetes-subnet-1`,
  {
    vpcId: vpc.id,
    cidrBlock: "10.0.4.0/24",
    mapPublicIpOnLaunch: true,
    availabilityZone: azs.then((az) => az.names[0]),
    tags: {
      Name: `${config.resourcePrefix}-public-kubernetes-subnet-1`,
      Public: "true",
    },
  }
);

const publicK8sSubnet2 = new aws.ec2.Subnet(
  `${config.resourcePrefix}-public-kubernetes-subnet-2`,
  {
    vpcId: vpc.id,
    cidrBlock: "10.0.5.0/24",
    mapPublicIpOnLaunch: true,
    availabilityZone: azs.then((az) => az.names[1]),
    tags: {
      Name: `${config.resourcePrefix}-public-kubernetes-subnet-2`,
      Public: "true",
    },
  }
);

const natEip = new aws.ec2.Eip(`${config.resourcePrefix}-nat-eip`, {
  domain: "vpc",
});

const natGateway = new aws.ec2.NatGateway(
  `${config.resourcePrefix}-nat-gateway`,
  {
    subnetId: publicK8sSubnet1.id,
    allocationId: natEip.id,
  }
);

const publicRouteTable = new aws.ec2.RouteTable(
  `${config.resourcePrefix}-public-route-table`,
  {
    vpcId: vpc.id,
    routes: [
      {
        cidrBlock: "0.0.0.0/0",
        gatewayId: gateway.id,
      },
    ],
  }
);

const privateRouteTable = new aws.ec2.RouteTable(
  `${config.resourcePrefix}-private-route-table`,
  {
    vpcId: vpc.id,
    routes: [
      {
        cidrBlock: "0.0.0.0/0",
        natGatewayId: natGateway.id,
      },
    ],
  }
);

const mongoRouteTableAssociation = new aws.ec2.RouteTableAssociation(
  `${config.resourcePrefix}-mongo-route-table-association`,
  {
    subnetId: mongoSubnet.id,
    routeTableId: publicRouteTable.id,
  }
);

const privateKubernetesRouteTableAssociation1 =
  new aws.ec2.RouteTableAssociation(
    `${config.resourcePrefix}-private-kubernetes-route-table-association-1`,
    {
      subnetId: privateK8sSubnet1.id,
      routeTableId: privateRouteTable.id,
    }
  );

const privateKubernetesRouteTableAssociation2 =
  new aws.ec2.RouteTableAssociation(
    `${config.resourcePrefix}-private-kubernetes-route-table-association-2`,
    {
      subnetId: privateK8sSubnet2.id,
      routeTableId: privateRouteTable.id,
    }
  );

const publicKubernetesRouteTableAssociation1 =
  new aws.ec2.RouteTableAssociation(
    `${config.resourcePrefix}-public-kubernetes-route-table-association-1`,
    {
      subnetId: publicK8sSubnet1.id,
      routeTableId: publicRouteTable.id,
    }
  );

const publicKubernetesRouteTableAssociation2 =
  new aws.ec2.RouteTableAssociation(
    `${config.resourcePrefix}-public-kubernetes-route-table-association-2`,
    {
      subnetId: publicK8sSubnet2.id,
      routeTableId: publicRouteTable.id,
    }
  );

const outBoundSecGroup = new aws.ec2.SecurityGroup(
  `${config.resourcePrefix}-out-bound-sec-group`,
  {
    description: "Enable outbound access to anywhere",
    vpcId: vpc.id,
    egress: [
      {
        fromPort: 0,
        toPort: 0,
        protocol: "-1",
        cidrBlocks: ["0.0.0.0/0"],
      },
    ],
  }
);

const sshSecGroup = new aws.ec2.SecurityGroup(
  `${config.resourcePrefix}-ssh-sec-group`,
  {
    description: "Enable SSH access",
    vpcId: vpc.id,
    ingress: [
      {
        fromPort: 22,
        toPort: 22,
        protocol: "tcp",
        cidrBlocks: ["0.0.0.0/0"],
      },
    ],
  }
);

const kubernetesSecGroup = new aws.ec2.SecurityGroup(
  `${config.resourcePrefix}-kubernetes-sec-group`,
  {
    description: "Enable access from kubernetes cluster to mongo",
    vpcId: vpc.id,
  }
);

const mongoSecGroupIngress = new aws.ec2.SecurityGroup(
  `${config.resourcePrefix}-mongo-sec-group-ingress`,
  {
    description: "Enable access from kubernetes cluster to mongo",
    vpcId: vpc.id,
    ingress: [
      {
        fromPort: 0,
        toPort: 27017,
        protocol: "tcp",
        securityGroups: [kubernetesSecGroup.id],
      },
    ],
  }
);

export const mongoSubnetId = mongoSubnet.id;
export const privateKubernetesSubnetIds = [
  privateK8sSubnet1.id,
  privateK8sSubnet2.id,
];
export const publicKubernetesSubnetIds = [
  publicK8sSubnet1.id,
  publicK8sSubnet2.id,
];
export const vpcId = vpc.id;
export const outBoundSecGroupId = outBoundSecGroup.id;
export const sshSecGroupId = sshSecGroup.id;
export const kubernetesSecGroupId = kubernetesSecGroup.id;
export const mongoSecGroupIngressId = mongoSecGroupIngress.id;
export const kubernetsSecGroup = kubernetesSecGroup;
