#!/bin/bash

# Quick Veridect Cloud Run Deployment
set -e

echo "🚀 Quick Deploy Veridect to Cloud Run"
echo "====================================="

# Check prerequisites
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Please install Google Cloud SDK first."
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

# Get or set project ID
if [ -z "$PROJECT_ID" ]; then
    echo "Enter your Google Cloud Project ID:"
    read PROJECT_ID
    export PROJECT_ID
fi

echo "Using Project ID: $PROJECT_ID"

# Login and set project
echo "🔐 Authenticating with Google Cloud..."
gcloud auth login --brief
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔌 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com

# Configure Docker
echo "🐳 Configuring Docker for GCR..."
gcloud auth configure-docker

# Build the app
echo "🏗️ Building application..."
npm run build

# Build Docker image
echo "📦 Building Docker image..."
IMAGE_NAME="gcr.io/$PROJECT_ID/veridect"
docker build -t $IMAGE_NAME .

# Push to registry
echo "📤 Pushing to Container Registry..."
docker push $IMAGE_NAME

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy veridect-app \
    --image $IMAGE_NAME \
    --region europe-west1 \
    --platform managed \
    --allow-unauthenticated \
    --port 8080 \
    --memory 1Gi \
    --cpu 1 \
    --max-instances 10 \
    --min-instances 0 \
    --set-env-vars NODE_ENV=production,PORT=8080

# Get service URL
SERVICE_URL=$(gcloud run services describe veridect-app --region=europe-west1 --format="value(status.url)")

echo ""
echo "✅ Deployment Complete!"
echo "========================"
echo "🌐 Your Veridect app is live at:"
echo "$SERVICE_URL"
echo ""
echo "🔍 Health check: $SERVICE_URL/health"
echo ""
echo "📝 Next: Set your environment variables:"
echo "gcloud run services update veridect-app --region=europe-west1 \\"
echo "  --set-env-vars DATABASE_URL=your_db_url,SESSION_SECRET=your_secret"