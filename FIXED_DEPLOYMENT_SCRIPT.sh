#!/bin/bash

# Veridect Fixed Deployment Script
set -e

PROJECT_ID="veridect-fixed"
REGION="europe-west1"
REPO_NAME="veridect-repo"
IMAGE_NAME="veridect"

echo "Starting Veridect deployment with Artifact Registry..."

# Configure Docker authentication for Artifact Registry
echo "Configuring Docker authentication..."
gcloud auth configure-docker europe-west1-docker.pkg.dev

# Enable required services
echo "Enabling required Google Cloud services..."
gcloud services enable artifactregistry.googleapis.com
gcloud services enable run.googleapis.com

# Create Artifact Registry repository (ignore if exists)
echo "Creating Artifact Registry repository..."
gcloud artifacts repositories create $REPO_NAME \
  --repository-format=docker \
  --location=$REGION \
  --project=$PROJECT_ID || echo "Repository already exists, continuing..."

# Install dependencies
echo "Installing dependencies..."
npm install @stripe/react-stripe-js @stripe/stripe-js

# Fix subscription file
echo "Fixing subscription component..."
cp subscription-clean.tsx client/src/pages/subscription.tsx

# Build application
echo "Building application..."
npm run build

# Build Docker image with Artifact Registry path
FULL_IMAGE_PATH="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$IMAGE_NAME"
echo "Building Docker image: $FULL_IMAGE_PATH"
docker build -t $FULL_IMAGE_PATH .

# Push to Artifact Registry
echo "Pushing to Artifact Registry..."
docker push $FULL_IMAGE_PATH

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy veridect-app \
  --image $FULL_IMAGE_PATH \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 10 \
  --project $PROJECT_ID

# Get service URL
echo "Getting service URL..."
SERVICE_URL=$(gcloud run services describe veridect-app \
  --region $REGION \
  --project $PROJECT_ID \
  --format="value(status.url)")

echo ""
echo "Deployment Complete!"
echo "==================="
echo "Your Veridect app is live at:"
echo "$SERVICE_URL"
echo ""

# Clean up
rm subscription-clean.tsx

echo "Deployment successful! Your food analysis app is ready."