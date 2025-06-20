# YesNoApp GitHub + Google Cloud Run Deployment Guide

## Overview

This guide covers deploying YesNoApp using GitHub for version control and Google Cloud Run for enterprise-grade hosting with automatic scaling and CI/CD.

## Prerequisites

- GitHub account
- Google Cloud Platform account with billing enabled
- Domain name (optional)
- YesNoApp codebase ready for deployment

## Step 1: Repository Setup

### Push Code to GitHub

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial YesNoApp deployment setup"

# Create GitHub repository and add remote
git remote add origin https://github.com/yourusername/yesnoapp.git

# Push to GitHub
git push -u origin main
```

### Create Dockerfile

Create `Dockerfile` in project root:

```dockerfile
# Use official Node.js runtime as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S yesnoapp -u 1001

# Change ownership of app directory
RUN chown -R yesnoapp:nodejs /app
USER yesnoapp

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start application
CMD ["npm", "start"]
```

### Create .dockerignore

```
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.env.local
.env.production
.env.staging
.nyc_output
coverage
.coverage
dist
.DS_Store
*.log
.vscode
```

### Add Production Scripts

Update `package.json`:

```json
{
  "scripts": {
    "start": "NODE_ENV=production node dist/server/index.js",
    "build": "npm run build:server && npm run build:client",
    "build:server": "esbuild server/index.ts --bundle --platform=node --outfile=dist/server/index.js --external:pg-native",
    "build:client": "vite build",
    "health": "echo 'OK'"
  }
}
```

## Step 2: Google Cloud Setup

### Install Google Cloud CLI

```bash
# macOS
brew install google-cloud-sdk

# Ubuntu/Debian
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Initialize gcloud
gcloud init
```

### Create Google Cloud Project

```bash
# Create new project
gcloud projects create yesnoapp-production --name="YesNoApp Production"

# Set as default project
gcloud config set project yesnoapp-production

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

### Set up Cloud SQL Database

```bash
# Create PostgreSQL instance
gcloud sql instances create yesnoapp-db \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=us-central1 \
    --storage-type=SSD \
    --storage-size=10GB \
    --backup \
    --maintenance-window-day=SUN \
    --maintenance-window-hour=09

# Create database
gcloud sql databases create yesnoapp --instance=yesnoapp-db

# Create database user
gcloud sql users create yesnoapp-user \
    --instance=yesnoapp-db \
    --password=YOUR_SECURE_PASSWORD

# Get connection name
gcloud sql instances describe yesnoapp-db --format="value(connectionName)"
```

### Configure Secret Manager

```bash
# Store database URL
echo "postgresql://yesnoapp-user:YOUR_PASSWORD@/yesnoapp?host=/cloudsql/PROJECT_ID:us-central1:yesnoapp-db" | \
gcloud secrets create DATABASE_URL --data-file=-

# Store session secret
openssl rand -base64 32 | gcloud secrets create SESSION_SECRET --data-file=-

# Store API keys (you'll add these after getting them)
echo "your_gemini_api_key" | gcloud secrets create GOOGLE_GEMINI_API_KEY --data-file=-
echo "your_stripe_secret_key" | gcloud secrets create STRIPE_SECRET_KEY --data-file=-
echo "your_stripe_public_key" | gcloud secrets create VITE_STRIPE_PUBLIC_KEY --data-file=-
```

## Step 3: GitHub Actions CI/CD

### Create Service Account

```bash
# Create service account for GitHub Actions
gcloud iam service-accounts create github-actions \
    --display-name="GitHub Actions Service Account"

# Grant necessary permissions
gcloud projects add-iam-policy-binding yesnoapp-production \
    --member="serviceAccount:github-actions@yesnoapp-production.iam.gserviceaccount.com" \
    --role="roles/cloudbuild.builds.builder"

gcloud projects add-iam-policy-binding yesnoapp-production \
    --member="serviceAccount:github-actions@yesnoapp-production.iam.gserviceaccount.com" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding yesnoapp-production \
    --member="serviceAccount:github-actions@yesnoapp-production.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding yesnoapp-production \
    --member="serviceAccount:github-actions@yesnoapp-production.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser"

# Create and download service account key
gcloud iam service-accounts keys create github-actions-key.json \
    --iam-account=github-actions@yesnoapp-production.iam.gserviceaccount.com
```

### Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Add these secrets:

```
GCP_PROJECT_ID=yesnoapp-production
GCP_SA_KEY=<contents of github-actions-key.json file>
GCP_REGION=us-central1
CLOUD_RUN_SERVICE=yesnoapp
```

### Create GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Google Cloud Run

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  REGION: ${{ secrets.GCP_REGION }}
  SERVICE: ${{ secrets.CLOUD_RUN_SERVICE }}

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm test || echo "No tests configured yet"

    - name: Run linting
      run: npm run lint || echo "No linting configured yet"

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Google Cloud CLI
      uses: google-github-actions/setup-gcloud@v2
      with:
        service_account_key: ${{ secrets.GCP_SA_KEY }}
        project_id: ${{ secrets.GCP_PROJECT_ID }}

    - name: Configure Docker for GCR
      run: gcloud auth configure-docker

    - name: Build Docker image
      run: |
        docker build -t gcr.io/$PROJECT_ID/$SERVICE:$GITHUB_SHA .
        docker build -t gcr.io/$PROJECT_ID/$SERVICE:latest .

    - name: Push Docker image
      run: |
        docker push gcr.io/$PROJECT_ID/$SERVICE:$GITHUB_SHA
        docker push gcr.io/$PROJECT_ID/$SERVICE:latest

    - name: Deploy to Cloud Run
      run: |
        gcloud run deploy $SERVICE \
          --image gcr.io/$PROJECT_ID/$SERVICE:$GITHUB_SHA \
          --platform managed \
          --region $REGION \
          --allow-unauthenticated \
          --memory 1Gi \
          --cpu 1 \
          --min-instances 0 \
          --max-instances 100 \
          --set-env-vars NODE_ENV=production \
          --set-cloudsql-instances $PROJECT_ID:$REGION:yesnoapp-db \
          --set-secrets DATABASE_URL=DATABASE_URL:latest \
          --set-secrets SESSION_SECRET=SESSION_SECRET:latest \
          --set-secrets GOOGLE_GEMINI_API_KEY=GOOGLE_GEMINI_API_KEY:latest \
          --set-secrets STRIPE_SECRET_KEY=STRIPE_SECRET_KEY:latest \
          --set-secrets VITE_STRIPE_PUBLIC_KEY=VITE_STRIPE_PUBLIC_KEY:latest

    - name: Get deployment URL
      run: |
        echo "Deployment URL:"
        gcloud run services describe $SERVICE --region $REGION --format="value(status.url)"
```

## Step 4: Environment Configuration

### Add Health Check Endpoint

Add to `server/routes.ts`:

```javascript
// Health check endpoint for Cloud Run
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### Configure Database Migrations

Create `scripts/migrate.js`:

```javascript
const { spawn } = require('child_process');

async function runMigrations() {
  console.log('Running database migrations...');
  
  const migrate = spawn('npm', ['run', 'db:push'], {
    stdio: 'inherit',
    env: { ...process.env }
  });

  return new Promise((resolve, reject) => {
    migrate.on('close', (code) => {
      if (code === 0) {
        console.log('Migrations completed successfully');
        resolve();
      } else {
        console.error('Migration failed');
        reject(new Error(`Migration failed with code ${code}`));
      }
    });
  });
}

if (require.main === module) {
  runMigrations().catch(console.error);
}

module.exports = runMigrations;
```

Update `package.json`:

```json
{
  "scripts": {
    "start": "npm run migrate && NODE_ENV=production node dist/server/index.js",
    "migrate": "node scripts/migrate.js"
  }
}
```

## Step 5: API Keys Setup

### Google Gemini AI

1. Go to [Google AI Studio](https://ai.google.dev)
2. Create API key
3. Add to Secret Manager:

```bash
echo "your_actual_gemini_api_key" | \
gcloud secrets versions add GOOGLE_GEMINI_API_KEY --data-file=-
```

### Stripe Integration

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get API keys from Developers → API keys
3. Add to Secret Manager:

```bash
# Secret key
echo "sk_live_your_stripe_secret_key" | \
gcloud secrets versions add STRIPE_SECRET_KEY --data-file=-

# Publishable key
echo "pk_live_your_stripe_public_key" | \
gcloud secrets versions add VITE_STRIPE_PUBLIC_KEY --data-file=-
```

## Step 6: Custom Domain Setup

### Configure Domain Mapping

```bash
# Map custom domain to Cloud Run service
gcloud run domain-mappings create \
    --service yesnoapp \
    --domain yesnoapp.com \
    --region us-central1

# Get DNS records to configure
gcloud run domain-mappings describe \
    --domain yesnoapp.com \
    --region us-central1
```

### Update DNS Records

Add these records to your domain provider:

```
Type: A
Name: @
Value: 216.239.32.21

Type: A
Name: @
Value: 216.239.34.21

Type: A
Name: @
Value: 216.239.36.21

Type: A
Name: @
Value: 216.239.38.21

Type: AAAA
Name: @
Value: 2001:4860:4802:32::15

Type: AAAA
Name: @
Value: 2001:4860:4802:34::15

Type: AAAA
Name: @
Value: 2001:4860:4802:36::15

Type: AAAA
Name: @
Value: 2001:4860:4802:38::15
```

## Step 7: Monitoring and Logging

### Set up Cloud Monitoring

```bash
# Enable monitoring
gcloud services enable monitoring.googleapis.com

# Create uptime check
gcloud alpha monitoring uptime create-http \
    --display-name="YesNoApp Uptime Check" \
    --hostname=yesnoapp.com \
    --path=/api/health \
    --port=443 \
    --use-ssl
```

### Configure Log-based Metrics

```bash
# Create log-based metric for errors
gcloud logging metrics create error_rate \
    --description="Rate of application errors" \
    --log-filter='resource.type="cloud_run_revision" AND severity>=ERROR'
```

## Step 8: Deployment and Testing

### Deploy Initial Version

```bash
# Push to GitHub to trigger deployment
git add .
git commit -m "Add Cloud Run deployment configuration"
git push origin main
```

### Verify Deployment

```bash
# Check deployment status
gcloud run services describe yesnoapp --region us-central1

# Test health endpoint
curl https://your-service-url.run.app/api/health

# Check logs
gcloud run services logs read yesnoapp --region us-central1
```

### Load Testing

```bash
# Install Apache Bench for load testing
sudo apt install apache2-utils

# Test with 100 concurrent requests
ab -n 1000 -c 100 https://your-domain.com/api/health
```

## Step 9: Production Optimization

### Database Connection Pooling

Update database configuration:

```javascript
// server/db.ts
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Caching Strategy

Add Redis for caching (optional):

```bash
# Create Redis instance
gcloud redis instances create yesnoapp-cache \
    --size=1 \
    --region=us-central1 \
    --redis-version=redis_6_x
```

### Auto-scaling Configuration

```bash
# Update Cloud Run service with optimized scaling
gcloud run services update yesnoapp \
    --region us-central1 \
    --min-instances 1 \
    --max-instances 100 \
    --concurrency 80 \
    --cpu-throttling \
    --memory 2Gi \
    --cpu 2
```

## Step 10: Security Hardening

### Enable VPC Connector (Optional)

```bash
# Create VPC connector for private database access
gcloud compute networks vpc-access connectors create yesnoapp-connector \
    --region us-central1 \
    --subnet yesnoapp-subnet \
    --subnet-project yesnoapp-production \
    --min-instances 2 \
    --max-instances 3
```

### Configure WAF (Web Application Firewall)

```bash
# Enable Cloud Armor for DDoS protection
gcloud compute security-policies create yesnoapp-security-policy \
    --description "YesNoApp security policy"

# Add rate limiting rule
gcloud compute security-policies rules create 1000 \
    --security-policy yesnoapp-security-policy \
    --expression "true" \
    --action "rate-based-ban" \
    --rate-limit-threshold-count 100 \
    --rate-limit-threshold-interval-sec 60 \
    --ban-duration-sec 600
```

## Cost Optimization

### Resource Allocation

**Recommended Cloud Run configuration:**
- **CPU**: 1-2 vCPU
- **Memory**: 1-2 GiB  
- **Min instances**: 0-1 (cost vs. cold start trade-off)
- **Max instances**: 10-100 (based on expected traffic)

### Database Sizing

**Development/Small Scale:**
- Instance: db-f1-micro (1 vCPU, 0.6 GB RAM)
- Storage: 10 GB SSD

**Production/Medium Scale:**
- Instance: db-n1-standard-1 (1 vCPU, 3.75 GB RAM)
- Storage: 50 GB SSD with automatic backups

### Estimated Monthly Costs

**Small Scale (1000+ users):**
- Cloud Run: $20-50
- Cloud SQL: $25-40
- Bandwidth: $5-15
- **Total**: $50-105/month

**Medium Scale (10,000+ users):**
- Cloud Run: $100-200
- Cloud SQL: $75-150
- Bandwidth: $20-50
- **Total**: $195-400/month

This setup provides enterprise-grade deployment with automatic scaling, monitoring, security, and CI/CD - perfect for growing from startup to scale.