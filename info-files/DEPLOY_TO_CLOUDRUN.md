# Deploy Veridect to Cloud Run - Quick Start

## Prerequisites Complete ✅
- Google Cloud SDK installed
- Docker installed

## Quick Deployment Steps

### 1. Download Project Files
```bash
# Download/clone the Veridect project to your local machine
# Make sure you have all the files including:
# - Dockerfile
# - package.json
# - All source code
```

### 2. Run Quick Deploy Script
```bash
# From the project directory
chmod +x quick-deploy.sh
./quick-deploy.sh
```

### 3. Set Environment Variables (Required)
```bash
# After deployment, set these environment variables
gcloud run services update veridect-app \
  --region europe-west1 \
  --set-env-vars \
  DATABASE_URL="postgresql://user:pass@host:5432/db",\
  GOOGLE_GEMINI_API_KEY="your-gemini-key",\
  SENDGRID_API_KEY="your-sendgrid-key",\
  SESSION_SECRET="your-session-secret"
  SESSION_SECRET="your-secure-32-char-secret",\
  GOOGLE_GEMINI_API_KEY="your-gemini-api-key",\
  REPL_ID="your-replit-app-id",\
  REPLIT_DOMAINS="your-service-url.run.app"
```

## Manual Deployment Alternative

### 1. Set Project
```bash
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID
gcloud auth login
```

### 2. Enable APIs
```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com  
gcloud services enable containerregistry.googleapis.com
```

### 3. Build and Deploy
```bash
# Configure Docker
gcloud auth configure-docker

# Build app
npm run build

# Build and push image
docker build -t gcr.io/$PROJECT_ID/veridect .
docker push gcr.io/$PROJECT_ID/veridect

# Deploy to Cloud Run
gcloud run deploy veridect-app \
  --image gcr.io/$PROJECT_ID/veridect \
  --region europe-west1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi
```

## Expected Output
After successful deployment, you'll get a URL like:
```
https://veridect-app-xxx-ey.a.run.app
```

## Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: 32+ character secure string  
- `GOOGLE_GEMINI_API_KEY`: From Google AI Studio
- `REPL_ID`: Your Replit app identifier
- `REPLIT_DOMAINS`: Your Cloud Run service domain

## Troubleshooting
- Ensure Docker is running
- Check you have billing enabled on Google Cloud
- Verify all required APIs are enabled
- Make sure you have sufficient permissions

Total deployment time: ~5-10 minutes