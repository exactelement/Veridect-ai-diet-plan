# YesNoApp Docker + Cloud Run Deployment Guide

## Overview

This guide covers containerizing YesNoApp with Docker and deploying to Google Cloud Run for production-grade hosting with automatic scaling, zero server management, and pay-per-use pricing.

## Prerequisites

- Docker installed locally
- Google Cloud SDK installed
- Google Cloud Platform account with billing enabled
- YesNoApp codebase ready for deployment

## Step 1: Docker Configuration

### Create Multi-Stage Dockerfile

Create `Dockerfile` in project root:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install security updates
RUN apk upgrade --no-cache

# Create app directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S yesnoapp -u 1001 -G nodejs

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist

# Copy database migration files
COPY drizzle.config.ts ./
COPY shared ./shared

# Change ownership to non-root user
RUN chown -R yesnoapp:nodejs /app

# Switch to non-root user
USER yesnoapp

# Expose port (Cloud Run uses PORT environment variable)
EXPOSE 8080

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

# Start application
CMD ["npm", "start"]
```

### Create .dockerignore

```
# Dependencies
node_modules
npm-debug.log*

# Production builds
dist
build

# Development files
.git
.gitignore
*.md
.env*
.vscode
.idea

# Testing
coverage
.nyc_output
test
tests
**/*.test.js
**/*.test.ts

# Logs
*.log
logs

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Mac
.DS_Store

# Windows
Thumbs.db

# Docker
Dockerfile*
docker-compose*
.dockerignore
```

### Update package.json

Add production-optimized scripts:

```json
{
  "scripts": {
    "start": "node dist/server/index.js",
    "build": "npm run build:server && npm run build:client",
    "build:server": "esbuild server/index.ts --bundle --platform=node --outfile=dist/server/index.js --external:pg-native --external:@neondatabase/serverless",
    "build:client": "vite build --outDir client/dist",
    "db:migrate": "drizzle-kit push:pg",
    "health": "curl -f http://localhost:8080/api/health || exit 1"
  }
}
```

### Add Health Endpoint

Update `server/routes.ts`:

```javascript
// Health check endpoint for Cloud Run
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    const result = await db.execute(sql`SELECT 1 as health`);
    
    res.status(200).json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: result ? 'connected' : 'disconnected',
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

### Configure Environment Variables

Update `server/index.ts` for Cloud Run:

```javascript
import express from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
const PORT = process.env.PORT || 8080; // Cloud Run uses PORT env var

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Trust proxy for Cloud Run
app.set('trust proxy', true);

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// CORS configuration for production
app.use((req, res, next) => {
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://yesnoapp.com',
    'https://www.yesnoapp.com'
  ].filter(Boolean);
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

async function startServer() {
  try {
    // Register API routes
    const server = await registerRoutes(app);
    
    // Serve static files in production
    if (process.env.NODE_ENV === 'production') {
      serveStatic(app);
    } else {
      await setupVite(app, server);
    }
    
    // Start server
    server.listen(PORT, '0.0.0.0', () => {
      log(`Server running on port ${PORT}`, "server");
      log(`Environment: ${process.env.NODE_ENV}`, "server");
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      log('SIGTERM received, shutting down gracefully', "server");
      server.close(() => {
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
```

## Step 2: Local Docker Testing

### Build Docker Image

```bash
# Build the Docker image
docker build -t yesnoapp:latest .

# Check image size
docker images yesnoapp:latest
```

### Test Locally

```bash
# Create .env.local for testing
cat > .env.local << EOF
NODE_ENV=production
PORT=8080
DATABASE_URL=your_local_postgres_url
SESSION_SECRET=test_session_secret_32_characters
GOOGLE_GEMINI_API_KEY=test_key
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLIC_KEY=pk_test_...
EOF

# Run container locally
docker run -p 8080:8080 \
  --env-file .env.local \
  yesnoapp:latest

# Test health endpoint
curl http://localhost:8080/api/health

# Test with load
for i in {1..10}; do curl http://localhost:8080/api/health & done; wait
```

### Debug Container

```bash
# Run container with shell access
docker run -it --entrypoint /bin/sh yesnoapp:latest

# Check container logs
docker logs <container_id>

# Inspect running container
docker exec -it <container_id> /bin/sh
```

## Step 3: Google Cloud Setup

### Configure Google Cloud Project

```bash
# Set project variables
export PROJECT_ID="yesnoapp-production"
export REGION="us-central1"
export SERVICE_NAME="yesnoapp"

# Create project (if not exists)
gcloud projects create $PROJECT_ID

# Set default project
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

### Set Up Artifact Registry

```bash
# Create Docker repository
gcloud artifacts repositories create yesnoapp-repo \
  --repository-format=docker \
  --location=$REGION \
  --description="YesNoApp Docker repository"

# Configure Docker authentication
gcloud auth configure-docker $REGION-docker.pkg.dev
```

### Create Cloud SQL Database

```bash
# Create PostgreSQL instance
gcloud sql instances create yesnoapp-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=$REGION \
  --storage-type=SSD \
  --storage-size=20GB \
  --backup \
  --maintenance-window-day=SUN \
  --maintenance-window-hour=09 \
  --deletion-protection

# Create database
gcloud sql databases create yesnoapp --instance=yesnoapp-db

# Create user with strong password
export DB_PASSWORD=$(openssl rand -base64 32)
gcloud sql users create yesnoapp-user \
  --instance=yesnoapp-db \
  --password=$DB_PASSWORD

# Store password securely
echo $DB_PASSWORD | gcloud secrets create DB_PASSWORD --data-file=-

echo "Database password stored in Secret Manager"
```

### Configure Secrets

```bash
# Database connection string
gcloud sql instances describe yesnoapp-db \
  --format="value(connectionName)" > connection_name.txt

export CONNECTION_NAME=$(cat connection_name.txt)
export DATABASE_URL="postgresql://yesnoapp-user:$DB_PASSWORD@localhost/yesnoapp?host=/cloudsql/$CONNECTION_NAME"

echo $DATABASE_URL | gcloud secrets create DATABASE_URL --data-file=-

# Session secret
openssl rand -base64 32 | gcloud secrets create SESSION_SECRET --data-file=-

# API keys (replace with actual values)
echo "your_google_gemini_api_key" | gcloud secrets create GOOGLE_GEMINI_API_KEY --data-file=-
echo "your_stripe_secret_key" | gcloud secrets create STRIPE_SECRET_KEY --data-file=-
echo "your_stripe_public_key" | gcloud secrets create VITE_STRIPE_PUBLIC_KEY --data-file=-

# Optional: SendGrid for emails
echo "your_sendgrid_api_key" | gcloud secrets create SENDGRID_API_KEY --data-file=-
```

## Step 4: Build and Push Container

### Build for Production

```bash
# Tag image for Artifact Registry
export IMAGE_URL="$REGION-docker.pkg.dev/$PROJECT_ID/yesnoapp-repo/yesnoapp:latest"

# Build and tag
docker build -t $IMAGE_URL .

# Push to Artifact Registry
docker push $IMAGE_URL

# Verify upload
gcloud artifacts docker images list $REGION-docker.pkg.dev/$PROJECT_ID/yesnoapp-repo
```

### Multi-Architecture Build (Optional)

```bash
# Build for multiple architectures
docker buildx create --use
docker buildx build --platform linux/amd64,linux/arm64 \
  -t $IMAGE_URL --push .
```

## Step 5: Deploy to Cloud Run

### Create Service Account

```bash
# Create service account for Cloud Run
gcloud iam service-accounts create yesnoapp-runner \
  --display-name="YesNoApp Cloud Run Service Account"

# Grant access to secrets
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:yesnoapp-runner@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Grant access to Cloud SQL
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:yesnoapp-runner@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"
```

### Deploy to Cloud Run

```bash
# Deploy with optimized configuration
gcloud run deploy $SERVICE_NAME \
  --image=$IMAGE_URL \
  --platform=managed \
  --region=$REGION \
  --allow-unauthenticated \
  --service-account=yesnoapp-runner@$PROJECT_ID.iam.gserviceaccount.com \
  --add-cloudsql-instances=$PROJECT_ID:$REGION:yesnoapp-db \
  --memory=2Gi \
  --cpu=2 \
  --min-instances=0 \
  --max-instances=100 \
  --concurrency=80 \
  --timeout=300 \
  --cpu-throttling \
  --set-env-vars=NODE_ENV=production \
  --set-secrets=DATABASE_URL=DATABASE_URL:latest \
  --set-secrets=SESSION_SECRET=SESSION_SECRET:latest \
  --set-secrets=GOOGLE_GEMINI_API_KEY=GOOGLE_GEMINI_API_KEY:latest \
  --set-secrets=STRIPE_SECRET_KEY=STRIPE_SECRET_KEY:latest \
  --set-secrets=VITE_STRIPE_PUBLIC_KEY=VITE_STRIPE_PUBLIC_KEY:latest \
  --port=8080

# Get service URL
export SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
  --region=$REGION --format="value(status.url)")

echo "Service deployed at: $SERVICE_URL"
```

### Test Deployment

```bash
# Test health endpoint
curl $SERVICE_URL/api/health

# Test with authentication
curl -X POST $SERVICE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass"}'

# Load test
for i in {1..50}; do
  curl -s $SERVICE_URL/api/health > /dev/null &
done
wait
```

## Step 6: Custom Domain Setup

### Map Custom Domain

```bash
# Map domain to service
gcloud run domain-mappings create \
  --service=$SERVICE_NAME \
  --domain=yesnoapp.com \
  --region=$REGION

# Get DNS configuration
gcloud run domain-mappings describe yesnoapp.com \
  --region=$REGION \
  --format="value(status.resourceRecords[].name,status.resourceRecords[].rrdata)"
```

### SSL Certificate

Cloud Run automatically provisions SSL certificates for custom domains.

```bash
# Check certificate status
gcloud run domain-mappings describe yesnoapp.com \
  --region=$REGION \
  --format="value(status.conditions[].type,status.conditions[].status)"
```

## Step 7: Monitoring and Logging

### Set Up Monitoring

```bash
# Create uptime check
gcloud monitoring uptime create https-uptime-check \
  --display-name="YesNoApp Health Check" \
  --hostname=yesnoapp.com \
  --path=/api/health \
  --port=443

# Create alerting policy
gcloud alpha monitoring policies create \
  --policy-from-file=monitoring-policy.yaml
```

Create `monitoring-policy.yaml`:

```yaml
displayName: "YesNoApp Error Rate Alert"
conditions:
  - displayName: "High error rate"
    conditionThreshold:
      filter: 'resource.type="cloud_run_revision" AND resource.labels.service_name="yesnoapp"'
      comparison: COMPARISON_GREATER_THAN
      thresholdValue: 0.1
      duration: 300s
      aggregations:
        - alignmentPeriod: 60s
          perSeriesAligner: ALIGN_RATE
          crossSeriesReducer: REDUCE_MEAN
notificationChannels:
  - projects/$PROJECT_ID/notificationChannels/EMAIL_CHANNEL_ID
```

### Configure Log-Based Metrics

```bash
# Create custom metrics
gcloud logging metrics create api_requests \
  --description="API request count" \
  --log-filter='resource.type="cloud_run_revision" AND httpRequest.requestMethod!=""'

gcloud logging metrics create error_rate \
  --description="Application error rate" \
  --log-filter='resource.type="cloud_run_revision" AND severity>=ERROR'
```

## Step 8: CI/CD Pipeline with Cloud Build

### Create cloudbuild.yaml

```yaml
steps:
  # Build Docker image
  - name: 'gcr.io/cloud-builders/docker'
    args: [
      'build',
      '-t', '$_REGION-docker.pkg.dev/$PROJECT_ID/$_REPOSITORY/$_SERVICE:$COMMIT_SHA',
      '-t', '$_REGION-docker.pkg.dev/$PROJECT_ID/$_REPOSITORY/$_SERVICE:latest',
      '.'
    ]

  # Push to Artifact Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: [
      'push',
      '--all-tags',
      '$_REGION-docker.pkg.dev/$PROJECT_ID/$_REPOSITORY/$_SERVICE'
    ]

  # Deploy to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args: [
      'run', 'deploy', '$_SERVICE',
      '--image', '$_REGION-docker.pkg.dev/$PROJECT_ID/$_REPOSITORY/$_SERVICE:$COMMIT_SHA',
      '--region', '$_REGION',
      '--platform', 'managed',
      '--allow-unauthenticated'
    ]

substitutions:
  _REGION: us-central1
  _REPOSITORY: yesnoapp-repo
  _SERVICE: yesnoapp

options:
  logging: CLOUD_LOGGING_ONLY
  machineType: 'E2_HIGHCPU_8'
```

### Set Up Build Triggers

```bash
# Connect repository (GitHub/GitLab)
gcloud builds triggers create github \
  --repo-name=yesnoapp \
  --repo-owner=your-username \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml

# Manual build
gcloud builds submit --config cloudbuild.yaml .
```

## Step 9: Performance Optimization

### Container Optimization

```dockerfile
# Optimized Dockerfile with caching
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS deps
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 yesnoapp

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./

USER yesnoapp
EXPOSE 8080
CMD ["npm", "start"]
```

### Database Connection Pooling

```javascript
// Optimize database connections for Cloud Run
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5, // Limit connections for Cloud Run
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  statement_timeout: 30000,
  query_timeout: 30000,
});
```

### Memory and CPU Optimization

```bash
# Update Cloud Run service for better performance
gcloud run services update $SERVICE_NAME \
  --region=$REGION \
  --memory=1Gi \
  --cpu=1 \
  --concurrency=1000 \
  --max-instances=50 \
  --execution-environment=gen2
```

## Step 10: Security Hardening

### Container Security Scanning

```bash
# Enable vulnerability scanning
gcloud container images scan $IMAGE_URL

# Check scan results
gcloud container images list-tags $REGION-docker.pkg.dev/$PROJECT_ID/yesnoapp-repo/yesnoapp \
  --show-occurrences-from=VULNERABILITY
```

### Binary Authorization (Optional)

```bash
# Enable Binary Authorization
gcloud services enable binaryauthorization.googleapis.com

# Create policy
gcloud container binauthz policy import policy.yaml
```

### IAM Hardening

```bash
# Remove overly broad permissions
gcloud projects remove-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:yesnoapp-runner@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/editor"

# Add specific permissions only
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:yesnoapp-runner@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"
```

## Troubleshooting

### Common Issues

**Container won't start:**
```bash
# Check logs
gcloud run services logs read $SERVICE_NAME --region=$REGION

# Check resource limits
gcloud run services describe $SERVICE_NAME --region=$REGION
```

**Database connection failures:**
```bash
# Test Cloud SQL connection
gcloud sql connect yesnoapp-db --user=yesnoapp-user

# Check service account permissions
gcloud projects get-iam-policy $PROJECT_ID
```

**High cold start times:**
```bash
# Set minimum instances
gcloud run services update $SERVICE_NAME \
  --region=$REGION \
  --min-instances=1
```

This comprehensive Docker + Cloud Run setup provides enterprise-grade deployment with container security, automatic scaling, and professional DevOps practices.