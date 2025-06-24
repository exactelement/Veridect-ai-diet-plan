# GitHub to Cloud Run Deployment Guide

## Overview

This guide sets up automated deployment from GitHub to Google Cloud Run using GitHub Actions.

## Prerequisites

- Google Cloud Project with billing enabled
- GitHub repository for Veridect
- Service account with appropriate permissions

## Step 1: Create Service Account

```bash
# Set your project ID
export PROJECT_ID=your-project-id

# Create service account
gcloud iam service-accounts create github-actions \
    --display-name="GitHub Actions Service Account" \
    --project=$PROJECT_ID

# Grant necessary permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser"

# Create and download service account key
gcloud iam service-accounts keys create github-actions-key.json \
    --iam-account=github-actions@$PROJECT_ID.iam.gserviceaccount.com
```

## Step 2: Configure GitHub Secrets

Add these secrets to your GitHub repository settings:

1. **GCP_PROJECT_ID**: Your Google Cloud project ID
2. **GCP_SA_KEY**: Content of the `github-actions-key.json` file
3. **DATABASE_URL**: Your production database connection string
4. **SESSION_SECRET**: Secure session secret (32+ characters)
5. **GOOGLE_GEMINI_API_KEY**: Your Gemini AI API key
6. **REPL_ID**: Your Replit application ID
7. **REPLIT_DOMAINS**: Your Cloud Run service domain

## Step 3: GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  SERVICE_NAME: veridect-app
  REGION: europe-west1

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Google Cloud CLI
      uses: google-github-actions/setup-gcloud@v1
      with:
        service_account_key: ${{ secrets.GCP_SA_KEY }}
        project_id: ${{ secrets.GCP_PROJECT_ID }}

    - name: Configure Docker for GCR
      run: gcloud auth configure-docker

    - name: Build Docker image
      run: |
        docker build -t gcr.io/$PROJECT_ID/$SERVICE_NAME:$GITHUB_SHA \
                     -t gcr.io/$PROJECT_ID/$SERVICE_NAME:latest .

    - name: Push Docker image
      run: |
        docker push gcr.io/$PROJECT_ID/$SERVICE_NAME:$GITHUB_SHA
        docker push gcr.io/$PROJECT_ID/$SERVICE_NAME:latest

    - name: Deploy to Cloud Run
      run: |
        gcloud run deploy $SERVICE_NAME \
          --image gcr.io/$PROJECT_ID/$SERVICE_NAME:$GITHUB_SHA \
          --region $REGION \
          --platform managed \
          --allow-unauthenticated \
          --port 8080 \
          --memory 1Gi \
          --cpu 1 \
          --max-instances 10 \
          --min-instances 0 \
          --concurrency 80 \
          --timeout 300 \
          --set-env-vars NODE_ENV=production,PORT=8080 \
          --update-env-vars \
            DATABASE_URL="${{ secrets.DATABASE_URL }}",\
            SESSION_SECRET="${{ secrets.SESSION_SECRET }}",\
            GOOGLE_GEMINI_API_KEY="${{ secrets.GOOGLE_GEMINI_API_KEY }}",\
            REPL_ID="${{ secrets.REPL_ID }}",\
            REPLIT_DOMAINS="${{ secrets.REPLIT_DOMAINS }}"

    - name: Get service URL
      run: |
        SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
          --region=$REGION --format="value(status.url)")
        echo "Service deployed at: $SERVICE_URL"
```

## Step 4: Advanced Deployment Workflow

For more sophisticated deployments, create `.github/workflows/deploy-advanced.yml`:

```yaml
name: Advanced Deploy to Cloud Run

on:
  push:
    branches: [main]
    tags: ['v*']

env:
  PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  SERVICE_NAME: veridect-app
  REGION: europe-west1

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    - run: npm ci
    - run: npm run check
    # Add your test commands here

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup Google Cloud CLI
      uses: google-github-actions/setup-gcloud@v1
      with:
        service_account_key: ${{ secrets.GCP_SA_KEY }}
        project_id: ${{ secrets.GCP_PROJECT_ID }}

    - name: Configure Docker
      run: gcloud auth configure-docker

    - name: Set image tag
      id: image
      run: |
        if [[ $GITHUB_REF == refs/tags/* ]]; then
          echo "tag=${GITHUB_REF#refs/tags/}" >> $GITHUB_OUTPUT
        else
          echo "tag=$GITHUB_SHA" >> $GITHUB_OUTPUT
        fi

    - name: Build and push Docker image
      run: |
        docker build -t gcr.io/$PROJECT_ID/$SERVICE_NAME:${{ steps.image.outputs.tag }} .
        docker push gcr.io/$PROJECT_ID/$SERVICE_NAME:${{ steps.image.outputs.tag }}

    - name: Deploy to Cloud Run
      run: |
        gcloud run deploy $SERVICE_NAME \
          --image gcr.io/$PROJECT_ID/$SERVICE_NAME:${{ steps.image.outputs.tag }} \
          --region $REGION \
          --platform managed \
          --allow-unauthenticated \
          --port 8080 \
          --memory 1Gi \
          --cpu 1 \
          --max-instances 10 \
          --min-instances 1 \
          --concurrency 80 \
          --timeout 300 \
          --set-env-vars NODE_ENV=production,PORT=8080

    - name: Update environment variables
      run: |
        gcloud run services update $SERVICE_NAME \
          --region $REGION \
          --update-env-vars \
            DATABASE_URL="${{ secrets.DATABASE_URL }}",\
            SESSION_SECRET="${{ secrets.SESSION_SECRET }}",\
            GOOGLE_GEMINI_API_KEY="${{ secrets.GOOGLE_GEMINI_API_KEY }}",\
            REPL_ID="${{ secrets.REPL_ID }}",\
            REPLIT_DOMAINS="${{ secrets.REPLIT_DOMAINS }}"

    - name: Run database migrations
      run: |
        # Install gcloud SQL proxy if using Cloud SQL
        # curl -o cloud_sql_proxy https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64
        # chmod +x cloud_sql_proxy
        # ./cloud_sql_proxy -instances=$PROJECT_ID:$REGION:veridect-db=tcp:5432 &
        
        # Run migrations (adjust based on your setup)
        # npm run db:push

    - name: Test deployment
      run: |
        SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
          --region=$REGION --format="value(status.url)")
        
        # Wait for service to be ready
        sleep 30
        
        # Test health endpoint
        curl -f "$SERVICE_URL/health" || exit 1
        
        echo "Deployment successful: $SERVICE_URL"
```

## Step 5: Environment-Specific Deployments

For staging and production environments:

```yaml
name: Multi-Environment Deploy

on:
  push:
    branches: [main, staging]

jobs:
  deploy:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        environment: [staging, production]
        exclude:
          - environment: production
            # Only deploy to production from main branch
            if: github.ref != 'refs/heads/main'
          - environment: staging
            # Only deploy to staging from staging branch
            if: github.ref != 'refs/heads/staging'

    environment: ${{ matrix.environment }}
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to ${{ matrix.environment }}
      run: |
        SERVICE_NAME="veridect-${{ matrix.environment }}"
        
        gcloud run deploy $SERVICE_NAME \
          --image gcr.io/$PROJECT_ID/veridect:$GITHUB_SHA \
          --region $REGION \
          --set-env-vars NODE_ENV=${{ matrix.environment }}
```

## Step 6: Monitoring and Notifications

Add Slack notifications:

```yaml
    - name: Notify Slack on success
      if: success()
      uses: 8398a7/action-slack@v3
      with:
        status: success
        text: "Veridect deployed successfully to Cloud Run"
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

    - name: Notify Slack on failure
      if: failure()
      uses: 8398a7/action-slack@v3
      with:
        status: failure
        text: "Veridect deployment failed"
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## Security Best Practices

1. **Use Workload Identity** (recommended over service account keys):
```bash
# Configure workload identity pool
gcloud iam workload-identity-pools create "github-pool" \
  --location="global" \
  --display-name="GitHub Actions Pool"
```

2. **Limit service account permissions**:
   - Only grant minimum required roles
   - Use condition-based IAM policies
   - Regularly audit permissions

3. **Secure secrets management**:
   - Use Google Secret Manager for sensitive data
   - Rotate secrets regularly
   - Monitor secret access

## Troubleshooting

### Common Issues

1. **Authentication failures**:
   - Verify service account key is valid
   - Check IAM permissions
   - Ensure APIs are enabled

2. **Build failures**:
   - Check Dockerfile syntax
   - Verify all dependencies are available
   - Review build logs

3. **Deployment timeouts**:
   - Increase deployment timeout
   - Check application startup time
   - Verify health check endpoint

### Debug Commands

```bash
# Check service account permissions
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:github-actions@$PROJECT_ID.iam.gserviceaccount.com"

# View Cloud Run service details
gcloud run services describe veridect-app --region=europe-west1

# Check recent deployments
gcloud run revisions list --service=veridect-app --region=europe-west1
```

## Cost Optimization

1. **Use Cloud Build triggers** for automatic builds
2. **Implement proper caching** in Dockerfile
3. **Set appropriate resource limits**
4. **Use minimum instances = 0** for development

---

This setup provides automated, secure, and scalable deployment from GitHub to Google Cloud Run with proper monitoring and error handling.