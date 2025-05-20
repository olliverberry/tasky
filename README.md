# Tasky

Tasky is a modern task management application built with Go, MongoDB, and Docker. This repository is a fork of [jeffthorne/tasky](https://github.com/jeffthorne/tasky) with significant modifications to include AWS infrastructure deployment using Pulumi, Kubernetes orchestration, and various demonstration scripts.

## Features

- User authentication with JWT
- CRUD operations for tasks
- MongoDB integration for data persistence
- Docker support for easy deployment
- RESTful API endpoints
- HTML templates for web interface
- AWS infrastructure as code using Pulumi
- Kubernetes deployment on EKS
- Automated backup and monitoring scripts

## Project Structure

```
.
├── server/             # Go backend application
│   ├── assets/        # HTML templates and static files
│   ├── auth/          # Authentication related code
│   ├── controllers/   # API endpoint handlers
│   ├── database/      # Database connection and models
│   └── models/        # Data models
├── infrastructure/    # AWS infrastructure using Pulumi
│   ├── amis/         # Amazon Machine Image configurations
│   ├── mongodb/      # MongoDB infrastructure setup
│   ├── networking/   # VPC, subnets, and security groups
│   ├── s3/          # S3 bucket configurations
│   └── k8s/         # EKS cluster setup
├── deployment/       # Kubernetes deployment using Pulumi
│   ├── k8s/         # K8s manifests and configurations
│   └── configuration/ # Deployment-specific settings
└── scripts/         # AWS environment demonstration scripts
    ├── demo-ec2-launch.sh
    ├── demo-s3-backups.sh
    ├── demo-k8s-gd.sh
    ├── demo-wiz-exercise.sh
    ├── demo-audit-log.sh
    └── demo-ec2-connectivity.sh
```

## Prerequisites

- Go 1.x
- MongoDB
- Docker and Docker Compose
- Node.js and npm (for Pulumi)
- AWS CLI configured with appropriate credentials
- kubectl
- Pulumi CLI

## Infrastructure Setup

The infrastructure is managed using Pulumi and includes:

- VPC and networking components
- EKS cluster
- MongoDB deployment
- S3 buckets for backups
- EC2 instances
- Security groups and IAM roles

To deploy the infrastructure:

```bash
cd infrastructure
npm install
pulumi up
```

## Kubernetes Deployment

The application is deployed to EKS using Pulumi. The deployment includes:

- Kubernetes Deployment
- Service definitions
- ConfigMaps and Secrets
- Ingress configuration

To deploy to Kubernetes:

```bash
cd deployment
npm install
pulumi up
```

## Demonstration Scripts

The `scripts` directory contains various demonstration scripts for AWS environment features:

- `demo-ec2-launch.sh`: Demonstrates EC2 instance launch and configuration
- `demo-s3-backups.sh`: Shows S3 backup and restore procedures
- `demo-k8s-gd.sh`: Kubernetes deployment and scaling demonstrations
- `demo-wiz-exercise.sh`: Security and compliance checks
- `demo-audit-log.sh`: AWS CloudTrail and logging demonstrations
- `demo-ec2-connectivity.sh`: Network connectivity testing

To run any demonstration script:

```bash
cd scripts
chmod +x <script-name>.sh
./<script-name>.sh
```

## Environment Variables

The following environment variables are required:

| Variable | Purpose | Example |
|----------|---------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://servername:27017` or `mongodb://username:password@hostname:port` |
| `SECRET_KEY` | JWT secret key | `your-secret-key` |
| `AWS_ACCESS_KEY_ID` | AWS access key | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | `...` |
| `AWS_REGION` | AWS region | `us-west-2` |

## Running the Application

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tasky.git
   cd tasky
   ```

2. Install dependencies:
   ```bash
   cd server
   go mod tidy
   ```

3. Create a `.env` file with required environment variables
4. Run the application:
   ```bash
   go run main.go
   ```

### Docker Deployment

```bash
docker-compose up --build
```

## API Endpoints

- `GET /` - Login page
- `GET /todos/:userid` - Get all todos for a user
- `GET /todo/:id` - Get a specific todo
- `POST /todo/:userid` - Create a new todo
- `DELETE /todo/:userid/:id` - Delete a specific todo
- `DELETE /todos/:userid` - Clear all todos for a user
- `PUT /todo` - Update a todo
- `POST /signup` - Register a new user
- `POST /login` - User login
- `GET /todo` - Todo page

## Development

The project uses:
- Gin web framework for routing and HTTP handling
- MongoDB for data storage
- JWT for authentication
- Docker for containerization
- Pulumi for infrastructure as code
- Kubernetes for orchestration
- AWS for cloud infrastructure