# 📄 AskMyPDF - AI-Powered PDF Chatbot

> An intelligent document Q&A system built with FastAPI, React, Next.js, and Google Gemini AI, deployed on AWS cloud infrastructure

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.121.1-green.svg)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-blue.svg)](https://www.docker.com/)
[![AWS](https://img.shields.io/badge/AWS-S3%20%7C%20DynamoDB%20%7C%20EC2-orange.svg)](https://aws.amazon.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🌟 Features

- **AI-Powered Q&A**: Ask questions about your PDF documents using Google Gemini 2.0 Flash
- **Cloud-Native Architecture**: Built on AWS with S3 for storage and DynamoDB for chat history
- **Secure IAM Authentication**: Role-based access control with minimal permissions
- **Containerized Deployment**: Docker and Docker Compose for consistent environments
- **RESTful API**: FastAPI backend with automatic OpenAPI documentation
- **Modern UI**: React-based interactive web interface with Next.js and Tailwind CSS, featuring dark mode
- **Session Management**: Track conversation history across multiple PDFs
- **Scalable Design**: Ready for production deployment on AWS EC2

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Internet                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              AWS Security Group (Ports: 22, 3000, 8000)     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    EC2 Instance (Docker Host)                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Frontend Container (Next.js) - Port 3000            │  │
│  │  └──────────────┬───────────────────────────────────┘  │
│  │                 │ HTTP                                   │
│  │                 ▼                                         │
│  │  Backend Container (FastAPI) - Port 8000              │  │
│  │  ├─ PDF Processing (PyPDF)                            │  │
│  │  ├─ Gemini AI Integration ────────────────┐           │  │
│  │  ├─ S3 Client (boto3) ─────────────┐      │           │  │
│  │  └─ DynamoDB Client (boto3) ───┐   │      │           │  │
│  └───────────────────────────────┼───┼──────┼───────────┘  │
│                    IAM Role       │   │      │               │
└───────────────────────────────────┼───┼──────┼───────────────┘
                                    │   │      │
                    ┌───────────────┘   │      │
                    ▼                   ▼      ▼
         ┌──────────────────┐  ┌──────────────────┐  ┌──────────┐
         │  DynamoDB Table  │  │   S3 Bucket      │  │  Gemini  │
         │  (Chat History)  │  │  (PDF Storage)   │  │   API    │
         └──────────────────┘  └──────────────────┘  └──────────┘
```

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI 0.121.1 (Python async web framework)
- **Server**: Uvicorn 0.38.0 (ASGI server)
- **PDF Processing**: PyPDF 6.2.0
- **AWS SDK**: boto3 1.40.71 (S3 & DynamoDB)
- **AI Integration**: Google Gemini 2.0 Flash API

### Frontend
- **Framework**: Next.js 15 (React 19) with TypeScript
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Custom React components with dark mode support
- **State Management**: React Context + Custom Hooks
- **File Upload**: react-dropzone
- **Animations**: Framer Motion

### Infrastructure
- **Container Runtime**: Docker & Docker Compose
- **Cloud Platform**: AWS (EC2, S3, DynamoDB)
- **Security**: IAM Roles & Policies
- **Region**: us-west-2 (configurable)

## 📋 Prerequisites

- Python 3.11+
- Docker & Docker Compose
- AWS Account with:
  - S3 bucket
  - DynamoDB table
  - EC2 instance (for cloud deployment)
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/itsRenuka22/askmypdf-gemini-aws.git
   cd askmypdf-gemini-aws
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   nano .env  # Edit with your credentials
   ```

   Required variables:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=us-west-2
   S3_BUCKET=your-bucket-name
   DDB_TABLE=your-table-name
   BACKEND_URL=http://backend:8000
   ```

3. **Start the application**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend UI: http://localhost:8501
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### AWS Cloud Deployment

See detailed instructions in [EC2_DEPLOYMENT.md](EC2_DEPLOYMENT.md)

**Quick Deploy:**
```bash
# On your EC2 instance
curl -fsSL https://raw.githubusercontent.com/itsRenuka22/askmypdf-gemini-aws/main/scripts/ec2-setup.sh | bash
cd ~/askmypdf-gemini-aws
nano .env  # Configure your environment
docker-compose up -d
```

## 📁 Project Structure

```
askmypdf-gemini-aws/
├── backend/
│   ├── app.py              # FastAPI application & API endpoints
│   ├── aws_utils.py        # S3 and DynamoDB client utilities
│   ├── gemini_client.py    # Gemini AI integration
│   ├── settings.py         # Environment configuration
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile          # Backend container definition
├── frontend/
│   ├── app.py              # Streamlit UI application
│   ├── requirements.txt    # Frontend dependencies
│   └── Dockerfile          # Frontend container definition
├── infrastructure/
│   └── iam-policy.json     # Minimal IAM permissions policy
├── scripts/
│   ├── ec2-setup.sh        # Automated EC2 deployment script
│   └── smoke.sh            # Integration test script
├── docker-compose.yml      # Multi-container orchestration
├── .env.example            # Environment template
├── .gitignore              # Git ignore rules
├── EC2_DEPLOYMENT.md       # Detailed deployment guide
├── SECURITY.md             # Security best practices
└── README.md               # This file
```

## 🔌 API Endpoints

### Health Check
```http
GET /health
```
Returns system status and configuration

**Response:**
```json
{
  "ok": true,
  "bucket": "your-bucket-name",
  "table": "your-table-name"
}
```

### Upload PDFs
```http
POST /ingest
Content-Type: multipart/form-data
```

**Parameters:**
- `session_id` (form): Unique session identifier
- `files` (files): PDF files to upload

**Response:**
```json
{
  "session_id": "uuid",
  "files": ["session_id/pdfs/document.pdf"]
}
```

### Ask Questions
```http
POST /ask
Content-Type: application/json
```

**Request Body:**
```json
{
  "session_id": "uuid",
  "question": "What is this document about?"
}
```

**Response:**
```json
{
  "answer": "AI-generated answer...",
  "source": "session_id/pdfs/document.pdf",
  "contextChars": 883
}
```

## 🔐 Security

### IAM Policy
This project uses minimal AWS permissions:
- **S3**: `PutObject`, `GetObject`, `ListBucket`
- **DynamoDB**: `PutItem`, `Query`, `DescribeTable`

See [infrastructure/iam-policy.json](infrastructure/iam-policy.json)

### Best Practices
- ✅ Use IAM roles instead of access keys on EC2
- ✅ Store secrets in AWS Secrets Manager or Parameter Store
- ✅ Never commit `.env` to version control
- ✅ Restrict security group rules to specific IPs
- ✅ Enable CloudWatch logging for monitoring

See [SECURITY.md](SECURITY.md) for details.

## 🧪 Testing

Run the smoke test to verify deployment:
```bash
./scripts/smoke.sh
```

## 🐛 Troubleshooting

### Containers not starting
```bash
docker-compose logs
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Permission denied (Docker)
```bash
sudo usermod -aG docker $USER
# Log out and back in
```

### AWS credentials not working
```bash
# Test IAM role
aws sts get-caller-identity

# Test S3 access
aws s3 ls s3://your-bucket-name

# Test DynamoDB access
aws dynamodb describe-table --table-name your-table-name
```

### Gemini API quota exceeded
- Wait for quota reset (15 RPM, 1500 RPD)
- Get a new API key
- Upgrade to paid tier

## 📊 AWS Resources Setup

### Create S3 Bucket
```bash
aws s3 mb s3://your-bucket-name --region us-west-2
```

### Create DynamoDB Table
```bash
aws dynamodb create-table \
  --table-name your-table-name \
  --attribute-definitions \
    AttributeName=session_id,AttributeType=S \
    AttributeName=ts,AttributeType=N \
  --key-schema \
    AttributeName=session_id,KeyType=HASH \
    AttributeName=ts,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region us-west-2
```

## 💰 Cost Estimate

**Monthly costs for moderate usage:**
- EC2 t3.medium: ~$30/month (or $0.04/hour)
- S3 storage: ~$0.023/GB
- DynamoDB: Free tier (25GB, 25 WCU, 25 RCU)
- Gemini API: Free tier (15 RPM, 1500 RPD)

**Tip**: Stop EC2 when not in use to reduce costs!

## 🔄 Updating the Application

```bash
cd ~/askmypdf-gemini-aws
git pull origin main
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👩‍💻 Author

**Renuka**

- GitHub: [@itsRenuka22](https://github.com/itsRenuka22)
- Repository: [askmypdf-gemini-aws](https://github.com/itsRenuka22/askmypdf-gemini-aws)

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [Streamlit](https://streamlit.io/) - Rapid UI development
- [Google Gemini](https://ai.google.dev/) - AI-powered responses
- [AWS](https://aws.amazon.com/) - Cloud infrastructure
- [Docker](https://www.docker.com/) - Containerization platform

## 📞 Support

For issues or questions:
- Open an [Issue](https://github.com/itsRenuka22/askmypdf-gemini-aws/issues)
- Check the [EC2_DEPLOYMENT.md](EC2_DEPLOYMENT.md) guide
- Review the [SECURITY.md](SECURITY.md) guidelines

---

**Built with ❤️ using Python, AWS, and AI**
