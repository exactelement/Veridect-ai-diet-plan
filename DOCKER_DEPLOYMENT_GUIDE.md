# Veridect Docker & Cloud Run Deployment Guide

## Overview

This guide covers deploying Veridect as a Docker container to Google Cloud Run for production use.

## Prerequisites

### Required Tools
- Docker Desktop or Docker Engine
- Google Cloud SDK (gcloud CLI)
- Node.js 20+ (for local development)

### Google Cloud Setup
1. **Create Google Cloud Project**
   ```bash
   gcloud projects create your-project-id
   gcloud config set project your-project-id
   ```

2. **Enable Billing**
   - Enable billing for your project in Google Cloud Console
   - Required for Cloud Run usage

3. **Enable APIs**
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

## Local Docker Development

### Build Docker Image
```bash
# Build the image
npm run docker:build

# Run locally
npm run docker:run
```

### Manual Docker Commands
```bash
# Build image
docker build -t veridect .

# Run with environment variables
docker run -p 8080:8080 \
  -e DATABASE_URL="your_database_url" \
  -e SESSION_SECRET="your_session_secret" \
  -e GOOGLE_GEMINI_API_KEY="your_api_key" \
  veridect

# Check logs
docker logs <container_id>

# Execute shell in container
docker exec -it <container_id> /bin/sh
```

## Cloud Run Deployment

### Quick Deployment
```bash
# Set your project ID
export PROJECT_ID=your-project-id

# Deploy using automated script
npm run deploy:cloudrun
```

### Manual Deployment Steps

1. **Configure gcloud**
   ```bash
   gcloud auth login
   gcloud config set project your-project-id
   gcloud auth configure-docker
   ```

2. **Build and Push Image**
   ```bash
   # Build image
   docker build -t gcr.io/your-project-id/veridect .
   
   # Push to Container Registry
   docker push gcr.io/your-project-id/veridect
   ```

3. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy veridect-app \
     --image gcr.io/your-project-id/veridect \
     --region europe-west1 \
     --platform managed \
     --allow-unauthenticated \
     --port 8080 \
     --memory 1Gi \
     --cpu 1 \
     --max-instances 10 \
     --min-instances 1 \
     --concurrency 80 \
     --timeout 300
   ```

## Environment Variables Configuration

### Required Environment Variables
```bash
# Database
DATABASE_URL=postgresql://username:password@host:5432/database
PGDATABASE=your_database
PGHOST=your_db_host
PGPASSWORD=your_db_password
PGPORT=5432
PGUSER=your_db_user

# Authentication
SESSION_SECRET=your_secure_session_secret_minimum_32_chars
REPL_ID=your_replit_app_id
REPLIT_DOMAINS=your-cloudrun-service-url.run.app
ISSUER_URL=https://replit.com/oidc

# AI Integration
GOOGLE_GEMINI_API_KEY=your_gemini_api_key

# Production Settings
NODE_ENV=production
PORT=8080
```

### Set Environment Variables in Cloud Run
```bash
gcloud run services update veridect-app \
  --region europe-west1 \
  --set-env-vars \
  DATABASE_URL="your_database_url",\
  SESSION_SECRET="your_session_secret",\
  GOOGLE_GEMINI_API_KEY="your_api_key",\
  NODE_ENV="production",\
  PORT="8080"
```

## Database Setup for Cloud Run

### Option 1: Google Cloud SQL
```bash
# Create Cloud SQL instance
gcloud sql instances create veridect-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=europe-west1

# Create database
gcloud sql databases create veridect \
  --instance=veridect-db

# Create user
gcloud sql users create veridect-user \
  --instance=veridect-db \
  --password=your_secure_password

# Get connection string
gcloud sql instances describe veridect-db
```

### Option 2: External Database (Neon, Supabase, etc.)
Use your existing database connection string in environment variables.

## Production Configuration

### Cloud Run Service Configuration
```yaml
# service.yaml example
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: veridect-app
  annotations:
    run.googleapis.com/ingress: all
    run.googleapis.com/ingress-status: all
spec:
  template:
    metadata:
      annotations:
        run.googleapis.com/cpu-throttling: "false"
        run.googleapis.com/execution-environment: gen2
    spec:
      containerConcurrency: 80
      timeoutSeconds: 300
      containers:
      - image: gcr.io/your-project-id/veridect
        ports:
        - containerPort: 8080
        resources:
          limits:
            cpu: "1"
            memory: "1Gi"
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "8080"
```

### Monitoring and Logging
```bash
# View logs
gcloud logs tail veridect-app --region=europe-west1

# Monitor metrics
gcloud monitoring dashboards list

# Set up alerts
gcloud alpha monitoring policies create \
  --policy-from-file=alert-policy.yaml
```

## Security Configuration

### IAM and Security
```bash
# Create service account for Cloud Run
gcloud iam service-accounts create veridect-service \
  --display-name="Veridect Service Account"

# Grant necessary permissions
gcloud projects add-iam-policy-binding your-project-id \
  --member="serviceAccount:veridect-service@your-project-id.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"

# Deploy with service account
gcloud run services update veridect-app \
  --service-account=veridect-service@your-project-id.iam.gserviceaccount.com
```

### Secrets Management
```bash
# Store secrets in Secret Manager
gcloud secrets create database-url --data-file=-
gcloud secrets create session-secret --data-file=-
gcloud secrets create gemini-api-key --data-file=-

# Grant access to secrets
gcloud secrets add-iam-policy-binding database-url \
  --member="serviceAccount:veridect-service@your-project-id.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## Custom Domain Setup

### Domain Configuration
```bash
# Map custom domain
gcloud run domain-mappings create \
  --service veridect-app \
  --domain your-domain.com \
  --region europe-west1

# Verify domain ownership in Google Cloud Console
# Update DNS records as instructed
```

## Performance Optimization

### Cloud Run Settings
- **CPU**: 1 vCPU for production workloads
- **Memory**: 1Gi minimum, 2Gi for high traffic
- **Concurrency**: 80 requests per instance
- **Min Instances**: 1 to avoid cold starts
- **Max Instances**: 10-100 based on traffic

### Image Optimization
```dockerfile
# Multi-stage build for smaller images
FROM node:20-alpine AS builder
# ... build stage

FROM node:20-alpine AS production
# ... production stage with minimal dependencies
```

## Continuous Deployment

### GitHub Actions Integration
```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloud Run
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: google-github-actions/setup-gcloud@v1
      with:
        service_account_key: ${{ secrets.GCP_SA_KEY }}
        project_id: ${{ secrets.GCP_PROJECT_ID }}
    - run: |
        gcloud builds submit --tag gcr.io/${{ secrets.GCP_PROJECT_ID }}/veridect
        gcloud run deploy veridect-app --image gcr.io/${{ secrets.GCP_PROJECT_ID }}/veridect --region europe-west1
```

### Cloud Build Triggers
```bash
# Connect repository to Cloud Build
gcloud builds triggers create github \
  --repo-name=your-repo \
  --repo-owner=your-username \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml
```

## Troubleshooting

### Common Issues

1. **Container Fails to Start**
   ```bash
   # Check logs
   gcloud logs tail veridect-app --region=europe-west1
   
   # Verify health endpoint
   curl https://your-service-url/health
   ```

2. **Database Connection Issues**
   ```bash
   # Test database connectivity
   gcloud sql connect veridect-db --user=veridect-user
   
   # Check Cloud SQL proxy configuration
   cloud_sql_proxy -instances=your-project:europe-west1:veridect-db=tcp:5432
   ```

3. **Environment Variables Not Set**
   ```bash
   # List current environment variables
   gcloud run services describe veridect-app --region=europe-west1
   
   # Update environment variables
   gcloud run services update veridect-app \
     --region=europe-west1 \
     --set-env-vars KEY=VALUE
   ```

4. **Authentication Issues**
   - Verify REPLIT_DOMAINS includes Cloud Run service URL
   - Check SESSION_SECRET is properly set
   - Ensure database user has correct permissions

### Performance Monitoring
```bash
# CPU and memory usage
gcloud monitoring metrics list --filter="resource.type=cloud_run_revision"

# Request latency
gcloud logging read "resource.type=cloud_run_revision" --limit=50

# Error rate monitoring
gcloud logging read "resource.type=cloud_run_revision AND severity>=ERROR" --limit=20
```

## Cost Optimization

### Pricing Considerations
- **CPU allocation**: Only charged when processing requests
- **Memory**: Charged for allocated memory while running
- **Requests**: First 2 million requests per month are free
- **Data transfer**: Egress charges apply

### Cost Optimization Tips
1. Use minimum required memory allocation
2. Set appropriate max instances to control costs
3. Implement request batching where possible
4. Use Cloud CDN for static assets
5. Monitor and set budget alerts

## Maintenance

### Regular Tasks
```bash
# Update base image
docker build -t gcr.io/your-project-id/veridect . --no-cache

# Deploy new version
gcloud run deploy veridect-app --image gcr.io/your-project-id/veridect

# Clean up old images
gcloud container images list-tags gcr.io/your-project-id/veridect --filter='-tags:*' --format='get(digest)' --limit=10 | xargs -I {} gcloud container images delete gcr.io/your-project-id/veridect@{}
```

### Backup Strategy
```bash
# Database backup
gcloud sql export sql veridect-db gs://your-backup-bucket/backup-$(date +%Y%m%d).sql --database=veridect

# Image backup
gcloud container images add-tag gcr.io/your-project-id/veridect gcr.io/your-project-id/veridect:backup-$(date +%Y%m%d)
```

---

**Deployment Guide Version**: 1.0  
**Last Updated**: June 23, 2025  
**Platform**: Google Cloud Run  
**Next Review**: Monthly maintenance cycle