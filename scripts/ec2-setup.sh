#!/usr/bin/env bash
# EC2 Setup Script for DocQuery Application
# This script sets up Docker, docker-compose, and pulls/runs the application

set -euo pipefail

echo "======================================"
echo "DocQuery EC2 Setup Script"
echo "======================================"

# Update system
echo "[1/6] Updating system packages..."
sudo yum update -y || sudo apt-get update -y

# Install Docker
echo "[2/6] Installing Docker..."
if ! command -v docker &> /dev/null; then
    # For Amazon Linux 2
    sudo yum install -y docker || sudo apt-get install -y docker.io
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER
    echo "Docker installed. You may need to log out and back in for group changes to take effect."
else
    echo "Docker already installed"
fi

# Install Docker Compose
echo "[3/6] Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "Docker Compose installed"
else
    echo "Docker Compose already installed"
fi

# Install Git (if not present)
echo "[4/6] Checking Git installation..."
if ! command -v git &> /dev/null; then
    sudo yum install -y git || sudo apt-get install -y git
fi

# Clone repository
echo "[5/6] Setting up application..."
read -p "Enter GitHub repository URL (default: https://github.com/itsRenuka22/askmypdf-gemini-aws.git): " REPO_URL
REPO_URL=${REPO_URL:-https://github.com/itsRenuka22/askmypdf-gemini-aws.git}

APP_DIR="/home/$USER/askmypdf-gemini-aws"
if [ -d "$APP_DIR" ]; then
    echo "Directory exists. Pulling latest changes..."
    cd "$APP_DIR"
    git pull
else
    echo "Cloning repository..."
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

# Create .env file
echo "[6/6] Configuring environment variables..."
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env

    echo ""
    echo "⚠️  IMPORTANT: Edit the .env file with your actual credentials:"
    echo "   nano $APP_DIR/.env"
    echo ""
    echo "You need to set:"
    echo "  - GEMINI_API_KEY (from Google AI Studio)"
    echo "  - AWS credentials (or use EC2 IAM role - recommended)"
    echo "  - S3_BUCKET name"
    echo "  - DDB_TABLE name"
    echo ""
else
    echo ".env file already exists"
fi

echo ""
echo "======================================"
echo "Setup Complete! 🎉"
echo "======================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Configure IAM Role for EC2 (recommended):"
echo "   - Use infrastructure/iam-policy.json"
echo "   - Attach role to EC2 instance"
echo "   - Remove AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY from .env"
echo ""
echo "2. Edit environment variables:"
echo "   nano $APP_DIR/.env"
echo ""
echo "3. Configure Security Group:"
echo "   - Allow port 8000 (Backend API)"
echo "   - Allow port 8501 (Frontend UI)"
echo ""
echo "4. Start the application:"
echo "   cd $APP_DIR"
echo "   docker-compose up -d"
echo ""
echo "5. View logs:"
echo "   docker-compose logs -f"
echo ""
echo "6. Access the application:"
echo "   Frontend: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8501"
echo "   Backend API: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8000/health"
echo ""
