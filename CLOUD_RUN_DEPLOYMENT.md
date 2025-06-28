# Veridect Cloud Run Deployment Guide

This guide explains how to deploy Veridect to Google Cloud Run using the Docker container setup.

## Prerequisites

1. **Google Cloud SDK**: Install and authenticate
   ```bash
   # Install Google Cloud SDK
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL
   
   # Authenticate
   gcloud auth login
   gcloud auth application-default login
   ```

2. **Docker** (for local testing only)
   ```bash
   # Install Docker (varies by OS)
   # For Ubuntu/Debian:
   sudo apt update && sudo apt install docker.io
   ```

3. **Environment Variables**: Set up your production environment variables in Google Cloud Run

## Quick Deployment

### Option 1: Automated Deployment (Recommended)

```bash
# Set your Google Cloud project ID
export GOOGLE_CLOUD_PROJECT="your-project-id"

# Run the automated deployment script
./deploy-cloudrun.sh
```

This script will:
- Enable required Google Cloud APIs
- Build the Docker image using Cloud Build
- Deploy to Cloud Run with optimized settings
- Provide the service URL

### Option 2: Manual Deployment

```bash
# 1. Set project
gcloud config set project YOUR_PROJECT_ID

# 2. Enable APIs
gcloud services enable cloudbuild.googleapis.com run.googleapis.com

# 3. Build and deploy
gcloud builds submit --config cloudbuild.yaml

# 4. Get service URL
gcloud run services describe veridect-app --region=europe-west1 --format="value(status.url)"
```

## Docker Configuration

### Multi-Stage Build
The Dockerfile uses a multi-stage build for optimization:
- **Builder stage**: Installs dependencies and builds the application
- **Production stage**: Creates minimal runtime image with only production dependencies

### Security Features
- Non-root user execution (user: veridect)
- Minimal Alpine Linux base image
- Proper signal handling with dumb-init
- Health checks for container orchestration

### Performance Optimizations
- Production-only dependencies in final image
- Optimized layer caching
- 2Gi memory, 2 vCPU configuration
- Auto-scaling from 0-20 instances

## Environment Variables for Cloud Run

Set these environment variables in Cloud Run:

### Required
```bash
DATABASE_URL=postgresql://...
GOOGLE_GEMINI_API_KEY=your_api_key
SESSION_SECRET=your_session_secret
```

### Authentication (if using OAuth)
```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
VITE_APPLE_CLIENT_ID=your_apple_client_id
```

### Payment Processing
```bash
STRIPE_SECRET_KEY=sk_live_...
VITE_STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
```

### Email Service
```bash
SENDGRID_API_KEY=SG....
```

## Local Testing

Before deploying to production, test the Docker image locally:

```bash
# Build the image
./docker-build-test.sh

# Create a .env file with your environment variables
cp .env.example .env
# Edit .env with your values

# Run locally
docker run -p 8080:8080 --env-file .env veridect-app:latest

# Test the application
curl http://localhost:8080/health
```

## Cloud Run Configuration

The deployment uses these optimized settings:

- **Region**: europe-west1 (GDPR compliance)
- **Memory**: 2Gi (for AI processing)
- **CPU**: 2 vCPU (for concurrent requests)
- **Concurrency**: 80 requests per instance
- **Scaling**: 0-20 instances (cost-effective)
- **Timeout**: 15 minutes (for complex AI operations)

## Monitoring and Logs

### View Logs
```bash
# Real-time logs
gcloud run services logs tail veridect-app --region=europe-west1

# Historical logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=veridect-app" --limit=50
```

### Health Monitoring
The Docker image includes health checks at `/health` endpoint for Cloud Run monitoring.

## Custom Domain Setup

To use a custom domain with Cloud Run:

```bash
# Map domain
gcloud run domain-mappings create --service=veridect-app --domain=yourdomain.com --region=europe-west1

# Verify domain ownership in Google Search Console
# Add DNS records as instructed by Google Cloud
```

## Troubleshooting

### Common Issues

1. **Build Failures**: Check cloudbuild.yaml syntax and project permissions
2. **Environment Variables**: Ensure all required secrets are set in Cloud Run
3. **Database Connection**: Verify DATABASE_URL and network access
4. **Authentication**: Check OAuth redirect URIs include your Cloud Run URL

### Debug Commands
```bash
# Check service status
gcloud run services describe veridect-app --region=europe-west1

# View recent deployments
gcloud run revisions list --service=veridect-app --region=europe-west1

# Check build history
gcloud builds list --limit=10
```

## Security Considerations

- Container runs as non-root user
- All secrets managed through Google Cloud Secret Manager
- HTTPS enforced by Cloud Run
- CORS configured for production domains
- Rate limiting implemented for API endpoints

## Cost Optimization

- Auto-scaling to 0 instances when not in use
- Efficient container startup time
- Optimized memory and CPU allocation
- Request-based billing model

For production deployment, the estimated costs are:
- Base: ~$20-50/month for moderate traffic
- Scale: Increases with usage and AI API calls
- Storage: Database costs separate (Neon or Cloud SQL)