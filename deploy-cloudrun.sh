#!/bin/bash

# Veridect Cloud Run Deployment Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID=${PROJECT_ID:-""}
REGION=${REGION:-"europe-west1"}
SERVICE_NAME=${SERVICE_NAME:-"veridect-app"}
IMAGE_NAME="gcr.io/$PROJECT_ID/veridect"

echo -e "${BLUE}🚀 Veridect Cloud Run Deployment${NC}"
echo "=================================="

# Check if PROJECT_ID is set
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ Error: PROJECT_ID environment variable is not set${NC}"
    echo "Please set it with: export PROJECT_ID=your-project-id"
    exit 1
fi

# Check if required tools are installed
command -v gcloud >/dev/null 2>&1 || { echo -e "${RED}❌ gcloud CLI is required but not installed.${NC}" >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { echo -e "${RED}❌ Docker is required but not installed.${NC}" >&2; exit 1; }

echo -e "${YELLOW}📋 Configuration:${NC}"
echo "  Project ID: $PROJECT_ID"
echo "  Region: $REGION"
echo "  Service Name: $SERVICE_NAME"
echo "  Image: $IMAGE_NAME"
echo ""

# Set the project
echo -e "${BLUE}🔧 Setting Google Cloud project...${NC}"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo -e "${BLUE}🔌 Enabling required APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Configure Docker for GCR
echo -e "${BLUE}🐳 Configuring Docker for Google Container Registry...${NC}"
gcloud auth configure-docker

# Build the Docker image
echo -e "${BLUE}🏗️  Building Docker image...${NC}"
docker build -t $IMAGE_NAME:latest .

# Tag the image with timestamp
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
docker tag $IMAGE_NAME:latest $IMAGE_NAME:$TIMESTAMP

# Push images to Container Registry
echo -e "${BLUE}📤 Pushing images to Container Registry...${NC}"
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
    --min-instances 1 \
    --concurrency 80 \
    --timeout 300 \
    --set-env-vars NODE_ENV=production,PORT=8080

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")

echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo "=================================="
echo -e "${GREEN}🌐 Service URL: $SERVICE_URL${NC}"
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "  1. Configure environment variables in Cloud Run"
echo "  2. Set up custom domain (optional)"
echo "  3. Configure monitoring and alerts"
echo ""
echo -e "${BLUE}📊 To view logs:${NC}"
echo "  gcloud logs tail $SERVICE_NAME --region=$REGION"
echo ""
echo -e "${BLUE}🔧 To update environment variables:${NC}"
echo "  gcloud run services update $SERVICE_NAME --region=$REGION --set-env-vars KEY=VALUE"