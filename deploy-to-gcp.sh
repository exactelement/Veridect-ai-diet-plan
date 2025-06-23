#!/bin/bash

# YesNoApp GCP Deployment Script
# This script deploys your app to Google Cloud Run

set -e

# Configuration
PROJECT_ID="yesnoapp-production"
REGION="us-central1"
SERVICE_NAME="yesnoapp"
IMAGE_NAME="yesnoapp"

echo "🚀 Starting YesNoApp deployment to Google Cloud Platform..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud SDK not found. Please install it first:"
    echo "   curl https://sdk.cloud.google.com | bash"
    echo "   exec -l \$SHELL"
    exit 1
fi

# Step 1: Set up project
echo "📋 Setting up Google Cloud project..."
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable secretmanager.googleapis.com

# Step 2: Create Artifact Registry repository
echo "📦 Creating Artifact Registry repository..."
gcloud artifacts repositories create $IMAGE_NAME-repo \
    --repository-format=docker \
    --location=$REGION \
    --description="YesNoApp Docker repository" || true

# Configure Docker authentication
gcloud auth configure-docker $REGION-docker.pkg.dev

# Step 3: Build and push Docker image
IMAGE_URL="$REGION-docker.pkg.dev/$PROJECT_ID/$IMAGE_NAME-repo/$IMAGE_NAME:latest"

echo "🏗️  Building Docker image..."
docker build -t $IMAGE_URL .

echo "📤 Pushing Docker image to Artifact Registry..."
docker push $IMAGE_URL

# Step 4: Create Cloud SQL database (if needed)
echo "🗄️  Setting up Cloud SQL database..."
DB_INSTANCE="yesnoapp-db"
DB_NAME="yesnoapp"
DB_USER="yesnoapp-user"

# Check if instance exists
if ! gcloud sql instances describe $DB_INSTANCE --quiet &>/dev/null; then
    echo "Creating Cloud SQL instance..."
    gcloud sql instances create $DB_INSTANCE \
        --database-version=POSTGRES_15 \
        --tier=db-f1-micro \
        --region=$REGION \
        --storage-type=SSD \
        --storage-size=20GB \
        --backup \
        --maintenance-window-day=SUN \
        --maintenance-window-hour=09
    
    # Create database
    gcloud sql databases create $DB_NAME --instance=$DB_INSTANCE
    
    # Create user (you'll need to set password manually)
    echo "⚠️  Please create database user manually:"
    echo "   gcloud sql users create $DB_USER --instance=$DB_INSTANCE --password=YOUR_PASSWORD"
else
    echo "Cloud SQL instance already exists"
fi

# Get connection name for database URL
CONNECTION_NAME=$(gcloud sql instances describe $DB_INSTANCE --format="value(connectionName)")
echo "Database connection name: $CONNECTION_NAME"

# Step 5: Set up secrets (user needs to add actual values)
echo "🔐 Setting up secrets..."
echo "Please add your secrets to Google Secret Manager:"
echo ""
echo "1. Database URL:"
echo "   echo 'postgresql://user:password@localhost/yesnoapp?host=/cloudsql/$CONNECTION_NAME' | gcloud secrets create DATABASE_URL --data-file=-"
echo ""
echo "2. Session Secret:"
echo "   openssl rand -base64 32 | gcloud secrets create SESSION_SECRET --data-file=-"
echo ""
echo "3. Google Gemini API Key:"
echo "   echo 'your_gemini_api_key' | gcloud secrets create GOOGLE_GEMINI_API_KEY --data-file=-"
echo ""
echo "4. Stripe Keys (if using payments):"
echo "   echo 'your_stripe_secret' | gcloud secrets create STRIPE_SECRET_KEY --data-file=-"
echo "   echo 'your_stripe_public' | gcloud secrets create VITE_STRIPE_PUBLIC_KEY --data-file=-"
echo ""
echo "5. Google OAuth (if using Google Sign-In):"
echo "   echo 'your_google_client_id' | gcloud secrets create GOOGLE_CLIENT_ID --data-file=-"
echo "   echo 'your_google_client_secret' | gcloud secrets create GOOGLE_CLIENT_SECRET --data-file=-"
echo ""
echo "6. Apple Sign-In (if using Apple authentication):"
echo "   echo 'com.yesnoapp.signin' | gcloud secrets create APPLE_SERVICE_ID --data-file=-"
echo "   echo 'your_team_id' | gcloud secrets create APPLE_TEAM_ID --data-file=-"
echo "   echo 'your_key_id' | gcloud secrets create APPLE_KEY_ID --data-file=-"
echo "   echo 'your_private_key_contents' | gcloud secrets create APPLE_PRIVATE_KEY --data-file=-"

# Step 6: Create service account
echo "👤 Creating service account..."
SERVICE_ACCOUNT="yesnoapp-runner@$PROJECT_ID.iam.gserviceaccount.com"

gcloud iam service-accounts create yesnoapp-runner \
    --display-name="YesNoApp Cloud Run Service Account" || true

# Grant permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/cloudsql.client"

# Step 7: Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image=$IMAGE_URL \
    --platform=managed \
    --region=$REGION \
    --allow-unauthenticated \
    --service-account=$SERVICE_ACCOUNT \
    --add-cloudsql-instances=$PROJECT_ID:$REGION:$DB_INSTANCE \
    --memory=2Gi \
    --cpu=2 \
    --min-instances=0 \
    --max-instances=100 \
    --concurrency=80 \
    --timeout=300 \
    --port=8080 \
    --set-env-vars=NODE_ENV=production

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
    --region=$REGION --format="value(status.url)")

echo ""
echo "🎉 Deployment complete!"
echo "📍 Service URL: $SERVICE_URL"
echo "📊 Monitor at: https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME"
echo ""
echo "⚠️  Don't forget to:"
echo "1. Add your actual secrets to Secret Manager"
echo "2. Update Cloud Run service with secret environment variables"
echo "3. Test your deployment"
echo ""
echo "To update secrets in Cloud Run:"
echo "gcloud run services update $SERVICE_NAME \\"
echo "  --region=$REGION \\"
echo "  --set-secrets=DATABASE_URL=DATABASE_URL:latest \\"
echo "  --set-secrets=SESSION_SECRET=SESSION_SECRET:latest \\"
echo "  --set-secrets=GOOGLE_GEMINI_API_KEY=GOOGLE_GEMINI_API_KEY:latest"