#!/bin/bash

# Veridect Cloud Run Deployment Script
# This script builds and deploys the Veridect app to Google Cloud Run

set -e

# Configuration
PROJECT_ID="${PROJECT_ID:-veridect-app}"
REGION="us-central1"
SERVICE_NAME="veridect"
REPOSITORY="veridect"

echo "🚀 Starting Veridect deployment to Cloud Run..."
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo "Service: $SERVICE_NAME"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI is not installed. Please install it first."
    exit 1
fi

# Check if authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Error: Not authenticated with gcloud. Run 'gcloud auth login' first."
    exit 1
fi

# Enable required APIs
echo "🔧 Enabling required Google Cloud APIs..."
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    --project=$PROJECT_ID

# Create Artifact Registry repository if it doesn't exist
echo "📦 Setting up Artifact Registry..."
if ! gcloud artifacts repositories describe $REPOSITORY \
    --location=$REGION \
    --project=$PROJECT_ID &> /dev/null; then
    
    gcloud artifacts repositories create $REPOSITORY \
        --repository-format=docker \
        --location=$REGION \
        --description="Veridect Docker repository" \
        --project=$PROJECT_ID
    
    echo "✅ Artifact Registry repository created"
else
    echo "✅ Artifact Registry repository already exists"
fi

# Configure Docker authentication
echo "🔐 Configuring Docker authentication..."
gcloud auth configure-docker $REGION-docker.pkg.dev --quiet

# Build and push using Cloud Build
echo "🏗️ Building and deploying with Cloud Build..."
gcloud builds submit \
    --config=cloudbuild.yaml \
    --project=$PROJECT_ID \
    --region=$REGION

echo "🎉 Deployment completed successfully!"

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
    --region=$REGION \
    --project=$PROJECT_ID \
    --format="value(status.url)")

echo "🌐 Your Veridect app is available at: $SERVICE_URL"
echo ""
echo "📊 To view logs:"
echo "gcloud logs tail --service=$SERVICE_NAME --project=$PROJECT_ID"
echo ""
echo "🔧 To update environment variables:"
echo "gcloud run services update $SERVICE_NAME --region=$REGION --project=$PROJECT_ID --set-env-vars=KEY=VALUE"