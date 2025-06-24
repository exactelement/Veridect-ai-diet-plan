# Veridect Cloud Run Deployment Guide

## Prerequisites

1. **Google Cloud Account**: Ensure you have a Google Cloud Platform account
2. **Google Cloud CLI**: Install and configure gcloud CLI
3. **Project Setup**: Create a new GCP project or use an existing one
4. **Billing**: Enable billing on your GCP project

## Environment Setup

### 1. Install Google Cloud CLI

```bash
# For macOS (using Homebrew)
brew install google-cloud-sdk

# For Linux/WSL
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# For Windows
# Download and run the installer from: https://cloud.google.com/sdk/docs/install
```

### 2. Authenticate with Google Cloud

```bash
# Login to Google Cloud
gcloud auth login

# Set your project ID
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID
```

### 3. Set Required Environment Variables

```bash
# Set your project ID
export PROJECT_ID="veridect-app"  # Replace with your actual project ID

# Optional: Set region (default is europe-west1)
export REGION="europe-west1"
```

## Deployment Methods

### Method 1: Automated Deployment (Recommended)

Use the provided deployment script:

```bash
# Make sure the script is executable
chmod +x deploy-cloudrun.sh

# Set your project ID
export PROJECT_ID="your-project-id"

# Run deployment
./deploy-cloudrun.sh
```

### Method 2: Manual Deployment

```bash
# 1. Enable required APIs
gcloud services enable cloudbuild.googleapis.com run.googleapis.com artifactregistry.googleapis.com

# 2. Create Artifact Registry repository
gcloud artifacts repositories create veridect \
    --repository-format=docker \
    --location=europe-west1 \
    --description="Veridect Docker repository"

# 3. Configure Docker authentication
gcloud auth configure-docker europe-west1-docker.pkg.dev

# 4. Build and deploy using Cloud Build
gcloud builds submit --config=cloudbuild.yaml
```

### Method 3: Local Build + Cloud Deploy

```bash
# 1. Test locally first
./docker-build-test.sh

# 2. Build for Cloud Run
docker build -t veridect:latest .

# 3. Tag for Artifact Registry
docker tag veridect:latest europe-west1-docker.pkg.dev/$PROJECT_ID/veridect/app:latest

# 4. Push to registry
docker push europe-west1-docker.pkg.dev/$PROJECT_ID/veridect/app:latest

# 5. Deploy to Cloud Run
gcloud run deploy veridect \
    --image europe-west1-docker.pkg.dev/$PROJECT_ID/veridect/app:latest \
    --region europe-west1 \
    --platform managed \
    --allow-unauthenticated \
    --port 8080 \
    --memory 2Gi \
    --cpu 2
```

## Configuration

### Environment Variables

Set required environment variables in Cloud Run:

```bash
gcloud run services update veridect \
    --region=europe-west1 \
    --set-env-vars=\
NODE_ENV=production,\
DATABASE_URL=your_database_url,\
SESSION_SECRET=your_session_secret,\
GOOGLE_GEMINI_API_KEY=your_gemini_key,\
REPL_ID=your_repl_id,\
REPLIT_DOMAINS=your_domains
```

### Service Configuration

The deployment includes these optimized settings:

- **Memory**: 2Gi (sufficient for AI processing)
- **CPU**: 2 vCPU (handles concurrent requests)
- **Concurrency**: 100 requests per instance
- **Timeout**: 900 seconds (for AI processing)
- **Auto-scaling**: 0-20 instances
- **Region**: europe-west1 (optimal for European users)

## Monitoring and Management

### View Service Status

```bash
# Check service status
gcloud run services describe veridect --region=europe-west1

# Get service URL
gcloud run services describe veridect \
    --region=europe-west1 \
    --format="value(status.url)"
```

### View Logs

```bash
# Real-time logs
gcloud logs tail --service=veridect

# Historical logs
gcloud logs read --service=veridect --limit=100
```

### Update Deployment

```bash
# Redeploy with latest code
gcloud builds submit --config=cloudbuild.yaml

# Update single environment variable
gcloud run services update veridect \
    --region=europe-west1 \
    --set-env-vars=NEW_VAR=value
```

## Custom Domain Setup

### 1. Verify Domain Ownership

```bash
# Add domain mapping
gcloud run domain-mappings create \
    --service=veridect \
    --domain=yourdomain.com \
    --region=europe-west1
```

### 2. Configure DNS

Add the provided DNS records to your domain registrar.

## Security Considerations

1. **IAM Permissions**: Use least privilege principle
2. **Environment Variables**: Store secrets in Secret Manager
3. **VPC**: Consider VPC connector for database access
4. **Authentication**: Configure proper authentication for admin endpoints

## Cost Optimization

- **Minimum Instances**: Set to 0 for cost savings
- **Request-based Billing**: Pay only for actual usage
- **Resource Limits**: Optimize memory/CPU based on actual needs
- **Regional Deployment**: Deploy close to users

## Troubleshooting

### Common Issues

1. **Build Failures**: Check cloudbuild.yaml syntax
2. **Memory Issues**: Increase memory allocation
3. **Timeout Issues**: Increase timeout setting
4. **Cold Starts**: Consider setting min-instances to 1

### Debug Commands

```bash
# Check build logs
gcloud builds log [BUILD_ID]

# Check service logs
gcloud logs read --service=veridect --severity=ERROR

# Test local container
docker run -p 8080:8080 veridect:latest
```

## Support

For deployment issues:
1. Check Cloud Run documentation
2. Review build and runtime logs
3. Test container locally first
4. Verify all environment variables are set

The deployment script provides detailed output and error handling to guide you through the process.