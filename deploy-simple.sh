#!/bin/bash

# Simple Cloud Run deployment without Cloud Build
set -e

PROJECT_ID="veridect-fixed"
REGION="us-central1"
SERVICE_NAME="veridect"

echo "🚀 Deploying Veridect to Cloud Run (Simple Method)..."
echo "Project: $PROJECT_ID"
echo "Region: $REGION"

# Enable Cloud Run API
gcloud services enable run.googleapis.com --project=$PROJECT_ID

# Deploy directly from source
gcloud run deploy $SERVICE_NAME \
  --source . \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --concurrency 1000 \
  --min-instances 0 \
  --max-instances 20 \
  --port 8080 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production"

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
  --region=$REGION \
  --project=$PROJECT_ID \
  --format="value(status.url)")

echo "✅ Deployment completed!"
echo "🌐 Your app is live at: $SERVICE_URL"
echo ""
echo "📝 Next steps:"
echo "1. Set environment variables in Cloud Run console:"
echo "   - DATABASE_URL (your PostgreSQL connection)"
echo "   - GOOGLE_API_KEY (for AI food analysis)"
echo "   - SESSION_SECRET (random secure string)"
echo "   - REPLIT_DOMAINS (your production domain)"
echo ""
echo "2. Configure your database and test the application"