# Veridect Deployment Diagnosis & Fix

## Issue Analysis
- Docker is running ✅
- Cloud Run service exists but image not found ❌
- Docker build/push likely failed silently

## Step-by-Step Solution

### 1. Check Docker Authentication
```bash
# Verify Docker can authenticate with GCR
gcloud auth configure-docker
```

### 2. Manual Build Test
```bash
# Test if Docker build works
docker build -t test-veridect .
docker images | grep test-veridect
```

### 3. Complete Deployment Sequence
```bash
# Install dependencies
npm install @stripe/react-stripe-js @stripe/stripe-js

# Fix subscription file
cp subscription-clean.tsx client/src/pages/subscription.tsx

# Build application
npm run build

# Build and tag Docker image
docker build -t gcr.io/veridect-fixed/veridect .

# Verify image was built
docker images | grep veridect

# Push to Google Container Registry
docker push gcr.io/veridect-fixed/veridect

# Deploy to Cloud Run
gcloud run deploy veridect-app \
  --image gcr.io/veridect-fixed/veridect \
  --region europe-west1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi

# Get your URL
gcloud run services describe veridect-app \
  --region europe-west1 \
  --format="value(status.url)"
```

## If Still Failing
Try using Artifact Registry instead of Container Registry:

```bash
# Enable Artifact Registry
gcloud services enable artifactregistry.googleapis.com

# Create repository
gcloud artifacts repositories create veridect-repo \
  --repository-format=docker \
  --location=europe-west1

# Configure Docker for Artifact Registry
gcloud auth configure-docker europe-west1-docker.pkg.dev

# Build and push using Artifact Registry
docker build -t europe-west1-docker.pkg.dev/veridect-fixed/veridect-repo/veridect .
docker push europe-west1-docker.pkg.dev/veridect-fixed/veridect-repo/veridect

# Deploy with new image path
gcloud run deploy veridect-app \
  --image europe-west1-docker.pkg.dev/veridect-fixed/veridect-repo/veridect \
  --region europe-west1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi
```