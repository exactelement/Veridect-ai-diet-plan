# Veridect Cloud Run Quick Start Guide

## Prerequisites
- Google Cloud SDK installed (`gcloud` CLI)
- Docker installed
- Google Cloud project with billing enabled

## Quick Deployment (5 minutes)

### 1. Set Environment Variables
```bash
export PROJECT_ID="your-google-cloud-project-id"
export REGION="europe-west1"
```

### 2. Enable Required Services
```bash
gcloud config set project $PROJECT_ID
gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com
```

### 3. Deploy Using Automated Script
```bash
# Make script executable and run
chmod +x deploy-cloudrun.sh
PROJECT_ID=$PROJECT_ID ./deploy-cloudrun.sh
```

## Manual Deployment Steps

### 1. Build and Push Docker Image
```bash
# Configure Docker for GCR
gcloud auth configure-docker

# Build image
docker build -t gcr.io/$PROJECT_ID/veridect .

# Push to Container Registry
docker push gcr.io/$PROJECT_ID/veridect
```

### 2. Deploy to Cloud Run
```bash
gcloud run deploy veridect-app \
  --image gcr.io/$PROJECT_ID/veridect \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 10 \
  --min-instances 1 \
  --set-env-vars NODE_ENV=production,PORT=8080
```

### 3. Configure Environment Variables
```bash
gcloud run services update veridect-app \
  --region $REGION \
  --set-env-vars \
  DATABASE_URL="your_database_connection_string",\
  SESSION_SECRET="your_secure_session_secret",\
  GOOGLE_GEMINI_API_KEY="your_gemini_api_key",\
  REPL_ID="your_replit_app_id",\
  REPLIT_DOMAINS="your-service-url.run.app"
```

## Required Environment Variables

Copy these to Cloud Run environment variables:

```
DATABASE_URL=postgresql://user:pass@host:5432/db
SESSION_SECRET=your-32-char-secret
GOOGLE_GEMINI_API_KEY=your-gemini-key
REPL_ID=your-replit-app-id
REPLIT_DOMAINS=your-cloudrun-url.run.app
NODE_ENV=production
PORT=8080
```

## Database Setup Options

### Option 1: Google Cloud SQL
```bash
# Create PostgreSQL instance
gcloud sql instances create veridect-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=$REGION

# Create database and user
gcloud sql databases create veridect --instance=veridect-db
gcloud sql users create veridect --instance=veridect-db --password=secure_password
```

### Option 2: Use Existing Database
- Neon PostgreSQL
- Supabase
- Any PostgreSQL-compatible database

## Post-Deployment

### Get Service URL
```bash
SERVICE_URL=$(gcloud run services describe veridect-app \
  --region=$REGION \
  --format="value(status.url)")
echo "Veridect deployed at: $SERVICE_URL"
```

### View Logs
```bash
gcloud logs tail veridect-app --region=$REGION
```

### Test Health Endpoint
```bash
curl $SERVICE_URL/health
```

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Ensure all dependencies are in package.json
   - Check Docker build context excludes node_modules

2. **Service Won't Start**
   - Verify health check endpoint works
   - Check environment variables are set
   - Review Cloud Run logs

3. **Database Connection**
   - Verify DATABASE_URL format
   - Ensure database accepts connections
   - Check firewall rules for Cloud SQL

### Debug Commands
```bash
# Check service status
gcloud run services describe veridect-app --region=$REGION

# View recent logs
gcloud logs read "resource.type=cloud_run_revision" --limit=50

# Test local Docker build
docker run -p 8080:8080 -e NODE_ENV=production veridect
```

## Cost Optimization

- **Memory**: Start with 1Gi, adjust based on usage
- **CPU**: 1 vCPU sufficient for most workloads
- **Min Instances**: Set to 1 to avoid cold starts
- **Max Instances**: Set based on expected traffic

## Next Steps

1. Set up custom domain
2. Configure monitoring and alerts  
3. Set up CI/CD pipeline
4. Configure secrets management
5. Set up database backups

---

Total deployment time: ~5-10 minutes
Monthly cost estimate: $10-50 (depending on traffic)