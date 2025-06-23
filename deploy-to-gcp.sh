#!/bin/bash

# Enhanced Veridect GCP Deployment Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Veridect Google Cloud Platform Deployment${NC}"
echo "=============================================="

# Configuration with defaults
PROJECT_ID=${PROJECT_ID:-""}
REGION=${REGION:-"europe-west1"}
SERVICE_NAME=${SERVICE_NAME:-"veridect-app"}
IMAGE_NAME="gcr.io/$PROJECT_ID/veridect"

# Check if PROJECT_ID is set
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ Error: PROJECT_ID environment variable is not set${NC}"
    echo "Please set it with: export PROJECT_ID=your-project-id"
    exit 1
fi

echo -e "${YELLOW}📋 Deployment Configuration:${NC}"
echo "  Project ID: $PROJECT_ID"
echo "  Region: $REGION"
echo "  Service Name: $SERVICE_NAME"
echo "  Image: $IMAGE_NAME"
echo ""

# Verify required tools
echo -e "${BLUE}🔧 Checking prerequisites...${NC}"
command -v gcloud >/dev/null 2>&1 || { echo -e "${RED}❌ gcloud CLI required${NC}" >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { echo -e "${RED}❌ Docker required${NC}" >&2; exit 1; }

# Configure GCloud
echo -e "${BLUE}⚙️  Configuring Google Cloud...${NC}"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo -e "${BLUE}🔌 Enabling required APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Configure Docker authentication
echo -e "${BLUE}🐳 Configuring Docker authentication...${NC}"
gcloud auth configure-docker

# Build application
echo -e "${BLUE}🏗️  Building Veridect application...${NC}"
npm run build

# Build Docker image
echo -e "${BLUE}📦 Building Docker image...${NC}"
docker build -t $IMAGE_NAME:latest .

# Tag with timestamp
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
docker tag $IMAGE_NAME:latest $IMAGE_NAME:$TIMESTAMP

# Push to Container Registry
echo -e "${BLUE}📤 Pushing to Google Container Registry...${NC}"
docker push $IMAGE_NAME:latest
docker push $IMAGE_NAME:$TIMESTAMP

# Deploy to Cloud Run
echo -e "${BLUE}🚀 Deploying to Cloud Run...${NC}"
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME:latest \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --port 8080 \
    --memory 1Gi \
    --cpu 1 \
    --max-instances 10 \
    --min-instances 0 \
    --concurrency 80 \
    --timeout 300 \
    --set-env-vars NODE_ENV=production,PORT=8080

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")

echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo "=============================================="
echo -e "${GREEN}🌐 Service URL: $SERVICE_URL${NC}"
echo -e "${GREEN}🔍 Health Check: $SERVICE_URL/health${NC}"
echo ""

# Test health endpoint
echo -e "${BLUE}🏥 Testing health endpoint...${NC}"
if curl -s "$SERVICE_URL/health" > /dev/null; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${YELLOW}⚠️  Health check failed - service may still be starting${NC}"
fi

echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "  1. Set environment variables:"
echo "     gcloud run services update $SERVICE_NAME --region=$REGION \\"
echo "       --set-env-vars DATABASE_URL=your_db_url,SESSION_SECRET=your_secret"
echo ""
echo "  2. Configure custom domain (optional):"
echo "     gcloud run domain-mappings create --service=$SERVICE_NAME \\"
echo "       --domain=your-domain.com --region=$REGION"
echo ""
echo "  3. View logs:"
echo "     gcloud logs tail $SERVICE_NAME --region=$REGION"
echo ""
echo -e "${BLUE}📊 Monitor your deployment:${NC}"
echo "  Console: https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME"