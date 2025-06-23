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

# Step 5: Auto-deploy secrets from Replit environment
echo "🔐 Setting up secrets from Replit environment..."

# Function to create secret if environment variable exists
create_secret_if_exists() {
    local env_var=$1
    local secret_name=$2
    
    if [ -n "${!env_var}" ]; then
        echo "Creating secret: $secret_name"
        echo "${!env_var}" | gcloud secrets create "$secret_name" --data-file=- --quiet || \
        echo "${!env_var}" | gcloud secrets versions add "$secret_name" --data-file=- --quiet
    else
        echo "⚠️  Environment variable $env_var not found, skipping $secret_name"
    fi
}

# Deploy all available environment variables as secrets
create_secret_if_exists "DATABASE_URL" "DATABASE_URL"
create_secret_if_exists "SESSION_SECRET" "SESSION_SECRET"
create_secret_if_exists "GOOGLE_GEMINI_API_KEY" "GOOGLE_GEMINI_API_KEY"
create_secret_if_exists "STRIPE_SECRET_KEY" "STRIPE_SECRET_KEY"
create_secret_if_exists "VITE_STRIPE_PUBLIC_KEY" "VITE_STRIPE_PUBLIC_KEY"
create_secret_if_exists "GOOGLE_CLIENT_ID" "GOOGLE_CLIENT_ID"
create_secret_if_exists "GOOGLE_CLIENT_SECRET" "GOOGLE_CLIENT_SECRET"
create_secret_if_exists "APPLE_SERVICE_ID" "APPLE_SERVICE_ID"
create_secret_if_exists "APPLE_TEAM_ID" "APPLE_TEAM_ID"
create_secret_if_exists "APPLE_KEY_ID" "APPLE_KEY_ID"
create_secret_if_exists "APPLE_PRIVATE_KEY" "APPLE_PRIVATE_KEY"

# Generate session secret if not provided
if [ -z "$SESSION_SECRET" ]; then
    echo "Generating random session secret..."
    openssl rand -base64 32 | gcloud secrets create SESSION_SECRET --data-file=- --quiet || \
    openssl rand -base64 32 | gcloud secrets versions add SESSION_SECRET --data-file=- --quiet
fi

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

# Step 7: Deploy to Cloud Run with secrets
echo "🚀 Deploying to Cloud Run with environment variables..."

# Build secrets flags for Cloud Run
SECRETS_FLAGS=""
if gcloud secrets describe DATABASE_URL --quiet &>/dev/null; then
    SECRETS_FLAGS="$SECRETS_FLAGS --set-secrets=DATABASE_URL=DATABASE_URL:latest"
fi
if gcloud secrets describe SESSION_SECRET --quiet &>/dev/null; then
    SECRETS_FLAGS="$SECRETS_FLAGS --set-secrets=SESSION_SECRET=SESSION_SECRET:latest"
fi
if gcloud secrets describe GOOGLE_GEMINI_API_KEY --quiet &>/dev/null; then
    SECRETS_FLAGS="$SECRETS_FLAGS --set-secrets=GOOGLE_GEMINI_API_KEY=GOOGLE_GEMINI_API_KEY:latest"
fi
if gcloud secrets describe STRIPE_SECRET_KEY --quiet &>/dev/null; then
    SECRETS_FLAGS="$SECRETS_FLAGS --set-secrets=STRIPE_SECRET_KEY=STRIPE_SECRET_KEY:latest"
fi
if gcloud secrets describe GOOGLE_CLIENT_ID --quiet &>/dev/null; then
    SECRETS_FLAGS="$SECRETS_FLAGS --set-secrets=GOOGLE_CLIENT_ID=GOOGLE_CLIENT_ID:latest"
fi
if gcloud secrets describe GOOGLE_CLIENT_SECRET --quiet &>/dev/null; then
    SECRETS_FLAGS="$SECRETS_FLAGS --set-secrets=GOOGLE_CLIENT_SECRET=GOOGLE_CLIENT_SECRET:latest"
fi
if gcloud secrets describe APPLE_SERVICE_ID --quiet &>/dev/null; then
    SECRETS_FLAGS="$SECRETS_FLAGS --set-secrets=APPLE_SERVICE_ID=APPLE_SERVICE_ID:latest"
fi
if gcloud secrets describe APPLE_TEAM_ID --quiet &>/dev/null; then
    SECRETS_FLAGS="$SECRETS_FLAGS --set-secrets=APPLE_TEAM_ID=APPLE_TEAM_ID:latest"
fi
if gcloud secrets describe APPLE_KEY_ID --quiet &>/dev/null; then
    SECRETS_FLAGS="$SECRETS_FLAGS --set-secrets=APPLE_KEY_ID=APPLE_KEY_ID:latest"
fi
if gcloud secrets describe APPLE_PRIVATE_KEY --quiet &>/dev/null; then
    SECRETS_FLAGS="$SECRETS_FLAGS --set-secrets=APPLE_PRIVATE_KEY=APPLE_PRIVATE_KEY:latest"
fi

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
    --set-env-vars=NODE_ENV=production \
    $SECRETS_FLAGS

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
    --region=$REGION --format="value(status.url)")

echo ""
echo "🎉 Deployment complete!"
echo "📍 Service URL: $SERVICE_URL"
echo "📊 Monitor at: https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME"
echo ""
echo "✅ Environment variables automatically deployed from Replit secrets!"
echo ""
echo "⚠️  Next steps:"
echo "1. Update OAuth redirect URIs with the new service URL: $SERVICE_URL"
echo "2. Test your deployment"
echo "3. Configure custom domain if needed"
echo ""
echo "OAuth Configuration:"
echo "- Google OAuth Console: Add $SERVICE_URL/api/auth/google/callback"
echo "- Apple Developer Portal: Add $SERVICE_URL/api/auth/apple/callback"