#!/bin/bash

# Veridect Cloud Run Deployment Script
set -e

echo "🚀 Starting Veridect Deployment to Cloud Run"
echo "============================================="

# Check Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    echo "   Look for the Docker whale icon in your menu bar."
    exit 1
fi

# Check required files
if [ ! -f "package.json" ] || [ ! -f "Dockerfile" ]; then
    echo "❌ Missing required files. Make sure you're in the project directory."
    echo "   Required: package.json, Dockerfile"
    exit 1
fi

# Check if subscription-clean.tsx exists
if [ ! -f "subscription-clean.tsx" ]; then
    echo "❌ subscription-clean.tsx not found. Please download it from Replit first."
    exit 1
fi

PROJECT_ID="veridect-fixed"
IMAGE_NAME="gcr.io/$PROJECT_ID/veridect"

echo "📦 Installing dependencies..."
npm install @stripe/react-stripe-js @stripe/stripe-js

echo "🔧 Fixing subscription file..."
cp subscription-clean.tsx client/src/pages/subscription.tsx

echo "🏗️  Building application..."
npm run build

echo "🐳 Building Docker image..."
docker build -t $IMAGE_NAME .

echo "📤 Pushing to Google Container Registry..."
docker push $IMAGE_NAME

echo "🚀 Deploying to Cloud Run..."
gcloud run deploy veridect-app \
  --image $IMAGE_NAME \
  --region europe-west1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 10

echo "🌐 Getting service URL..."
SERVICE_URL=$(gcloud run services describe veridect-app --region europe-west1 --format="value(status.url)")

echo ""
echo "✅ Deployment Complete!"
echo "======================="
echo "Your Veridect app is live at:"
echo "$SERVICE_URL"
echo ""
echo "🧹 Cleaning up..."
rm subscription-clean.tsx

echo "🎉 Done! Your food analysis app is ready to use."