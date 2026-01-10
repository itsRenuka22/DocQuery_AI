# EC2 Deployment Guide

This guide explains how to deploy the DocQuery application on AWS EC2 using Docker.

## Prerequisites

- AWS Account with:
  - EC2 instance (Amazon Linux 2 or Ubuntu recommended)
  - S3 bucket created (`askmypdf-renuka` or your bucket name)
  - DynamoDB table created (`askmypdf-chat`)
- Google Gemini API key
- GitHub repository access

## Deployment Options

### Option 1: Automated Setup (Recommended)

1. **Launch EC2 Instance**
   ```bash
   # Instance type: t3.medium or larger
   # OS: Amazon Linux 2 or Ubuntu 20.04+
   # Storage: 20GB minimum
   ```

2. **SSH into EC2**
   ```bash
   ssh -i your-key.pem ec2-user@your-ec2-ip
   ```

3. **Run Setup Script**
   ```bash
   # Download and run setup script
   curl -fsSL https://raw.githubusercontent.com/itsRenuka22/askmypdf-gemini-aws/main/scripts/ec2-setup.sh | bash

   # Or if repo is already cloned
   cd askmypdf-gemini-aws
   chmod +x scripts/ec2-setup.sh
   ./scripts/ec2-setup.sh
   ```

4. **Configure IAM Role (Recommended)**
   - Go to EC2 Console → IAM Roles
   - Create new role using `infrastructure/iam-policy.json`
   - Attach role to your EC2 instance
   - Remove `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` from `.env`

5. **Edit Environment Variables**
   ```bash
   cd /home/ec2-user/askmypdf-gemini-aws
   nano .env
   ```

   Update:
   ```bash
   GEMINI_API_KEY=your_actual_gemini_api_key
   # If not using IAM role, set these:
   # AWS_ACCESS_KEY_ID=your_access_key
   # AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=us-west-2
   S3_BUCKET=askmypdf-renuka
   DDB_TABLE=askmypdf-chat
   BACKEND_URL=http://backend:8000
   ```

6. **Configure Security Group**
   - Inbound Rules:
     - Port 8000 (Backend) - Source: Your IP or 0.0.0.0/0
     - Port 8501 (Frontend) - Source: Your IP or 0.0.0.0/0
     - Port 22 (SSH) - Source: Your IP

7. **Start Application**
   ```bash
   cd /home/ec2-user/askmypdf-gemini-aws
   docker-compose up -d
   ```

8. **Verify Deployment**
   ```bash
   # Check containers
   docker-compose ps

   # Check logs
   docker-compose logs -f

   # Test API
   curl http://localhost:8000/health
   ```

9. **Access Application**
   - Frontend: `http://YOUR-EC2-PUBLIC-IP:8501`
   - Backend API: `http://YOUR-EC2-PUBLIC-IP:8000`

### Option 2: Manual Setup

<details>
<summary>Click to expand manual setup instructions</summary>

1. **Install Docker**
   ```bash
   # Amazon Linux 2
   sudo yum update -y
   sudo yum install -y docker
   sudo systemctl start docker
   sudo systemctl enable docker
   sudo usermod -aG docker ec2-user

   # Ubuntu
   sudo apt-get update
   sudo apt-get install -y docker.io
   sudo systemctl start docker
   sudo systemctl enable docker
   sudo usermod -aG docker ubuntu
   ```

2. **Install Docker Compose**
   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **Clone Repository**
   ```bash
   git clone https://github.com/itsRenuka22/askmypdf-gemini-aws.git
   cd askmypdf-gemini-aws
   ```

4. **Configure Environment**
   ```bash
   cp .env.example .env
   nano .env
   ```

5. **Build and Start**
   ```bash
   docker-compose up -d
   ```

</details>

## Production Considerations

### 1. **Use IAM Roles Instead of Access Keys**
   - More secure
   - Automatic credential rotation
   - No hardcoded credentials

   ```bash
   # In .env, remove or comment out:
   # AWS_ACCESS_KEY_ID=...
   # AWS_SECRET_ACCESS_KEY=...
   ```

### 2. **Use AWS Systems Manager Parameter Store for Secrets**
   ```bash
   # Store Gemini API key in SSM
   aws ssm put-parameter \
     --name "/docquery/GEMINI_API_KEY" \
     --value "your-api-key" \
     --type "SecureString"

   # Update IAM policy to allow SSM access
   ```

### 3. **Enable HTTPS with Load Balancer**
   - Create Application Load Balancer
   - Configure SSL certificate (AWS Certificate Manager)
   - Route traffic through ALB
   - Update BACKEND_URL in .env

### 4. **Set Up Auto-Restart**
   ```bash
   # Add restart policy to docker-compose.yml
   services:
     backend:
       restart: unless-stopped
     frontend:
       restart: unless-stopped
   ```

### 5. **Enable Logging**
   ```bash
   # CloudWatch Logs
   docker-compose logs > /var/log/docquery.log

   # Or use CloudWatch Container Insights
   ```

### 6. **Set Up Monitoring**
   - CloudWatch Metrics
   - Container health checks
   - Uptime monitoring

## Troubleshooting

### Containers not starting
```bash
# Check logs
docker-compose logs

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Permission denied errors
```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Log out and back in
```

### AWS credentials not working
```bash
# Test IAM role (if using)
aws sts get-caller-identity

# Test S3 access
aws s3 ls s3://your-bucket-name

# Test DynamoDB access
aws dynamodb describe-table --table-name askmypdf-chat
```

### Port conflicts
```bash
# Check what's using ports
sudo lsof -i :8000
sudo lsof -i :8501

# Kill conflicting processes or change ports in docker-compose.yml
```

## Updating the Application

```bash
cd /home/ec2-user/askmypdf-gemini-aws

# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Verify
docker-compose ps
docker-compose logs -f
```

## Cost Optimization

1. **Use t3.medium or t3.large** (8-16GB RAM recommended)
2. **Stop instance when not in use** (development/testing)
3. **Use Reserved Instances** for production (up to 72% savings)
4. **Monitor S3 and DynamoDB usage**
5. **Set up billing alerts**

## Architecture

```
Internet
   ↓
EC2 Security Group (8000, 8501)
   ↓
EC2 Instance (Docker Host)
   ├─ Backend Container (8000) ← IAM Role
   │    ├─ FastAPI
   │    ├─ S3 Access
   │    └─ DynamoDB Access
   └─ Frontend Container (8501)
        └─ Streamlit → Backend
```

## Next Steps

After successful deployment:

1. **Test the application** with sample PDFs
2. **Set up backups** for DynamoDB
3. **Configure CloudWatch alarms**
4. **Enable S3 versioning** (optional)
5. **Set up CI/CD pipeline** (optional)

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Review [GitHub Issues](https://github.com/itsRenuka22/askmypdf-gemini-aws/issues)
- Test API health: `curl http://localhost:8000/health`
