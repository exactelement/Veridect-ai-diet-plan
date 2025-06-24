# Docker Deployment Guide for Veridect

## Overview

This guide covers building and deploying the Veridect application using Docker containers, with specific focus on Google Cloud Run deployment.

## Container Architecture

### Multi-Stage Build

The Dockerfile uses a multi-stage build process for optimal production deployment:

1. **Builder Stage**: Installs all dependencies and builds the application
2. **Production Stage**: Creates minimal runtime image with only production dependencies

### Security Features

- **Non-root User**: Application runs as `veridect` user (UID 1001)
- **Signal Handling**: Uses `dumb-init` for proper signal handling
- **Health Checks**: Built-in health endpoint monitoring
- **Minimal Base**: Alpine Linux for reduced attack surface

## Local Development

### Build and Test Locally

```bash
# Build the container
docker build -t veridect:latest .

# Test locally
./docker-build-test.sh

# Manual local run
docker run -d \
  --name veridect-local \
  -p 8080:8080 \
  -e NODE_ENV=production \
  -e DATABASE_URL=your_db_url \
  veridect:latest
```

### Development Workflow

```bash
# Build development version
docker build -t veridect:dev --target builder .

# Run with volume mounts for development
docker run -it \
  -v $(pwd):/app \
  -p 8080:8080 \
  veridect:dev npm run dev
```

## Production Deployment

### Environment Variables

Required environment variables for production:

```bash
NODE_ENV=production
PORT=8080
DATABASE_URL=postgresql://...
GOOGLE_GEMINI_API_KEY=your_key
SESSION_SECRET=your_secret
REPL_ID=your_repl_id
REPLIT_DOMAINS=your_domains
```

### Resource Requirements

**Minimum Requirements:**
- Memory: 1Gi
- CPU: 1 vCPU
- Storage: 10Gi

**Recommended (AI workloads):**
- Memory: 2Gi
- CPU: 2 vCPU
- Storage: 20Gi

## Google Cloud Run

### Automated Deployment

```bash
# Set project
export PROJECT_ID="your-project-id"

# Deploy using script
./deploy-cloudrun.sh
```

### Manual Cloud Run Deployment

```bash
# Build and push
gcloud builds submit --config=cloudbuild.yaml

# Deploy service
gcloud run deploy veridect \
  --image europe-west1-docker.pkg.dev/$PROJECT_ID/veridect/app:latest \
  --region europe-west1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 2Gi \
  --cpu 2 \
  --min-instances 0 \
  --max-instances 20
```

### Cloud Run Configuration

**Service Settings:**
- **Region**: europe-west1 (GDPR compliance)
- **Concurrency**: 100 requests per instance
- **Timeout**: 900 seconds (for AI processing)
- **Auto-scaling**: 0-20 instances
- **Execution Environment**: Gen2

**Security:**
- **Authentication**: Allow unauthenticated (app handles auth)
- **HTTPS**: Automatic TLS termination
- **Container Security**: Non-root execution

## Other Cloud Platforms

### AWS ECS/Fargate

```bash
# Build for AWS
docker build -t veridect:aws .

# Tag for ECR
docker tag veridect:aws $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/veridect:latest

# Push to ECR
docker push $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/veridect:latest
```

### Azure Container Instances

```bash
# Build for Azure
docker build -t veridect:azure .

# Tag for ACR
docker tag veridect:azure $REGISTRY_NAME.azurecr.io/veridect:latest

# Push to ACR
docker push $REGISTRY_NAME.azurecr.io/veridect:latest
```

### DigitalOcean App Platform

```bash
# Use the Dockerfile directly
# App Platform will build from source
```

## Container Optimization

### Image Size Optimization

- **Alpine Base**: Minimal Linux distribution
- **Multi-stage Build**: Excludes development dependencies
- **Layer Caching**: Optimized layer order for build cache
- **Clean Installation**: Removes package manager cache

### Performance Tuning

```dockerfile
# Memory optimization
ENV NODE_OPTIONS="--max-old-space-size=1536"

# CPU optimization
ENV UV_THREADPOOL_SIZE=4

# Disable source maps in production
ENV GENERATE_SOURCEMAP=false
```

## Monitoring and Logging

### Health Checks

The container includes a built-in health check:

```bash
# Manual health check
curl http://localhost:8080/health
```

### Logging Configuration

```bash
# View container logs
docker logs veridect-container

# Cloud Run logs
gcloud logs tail --service=veridect --project=$PROJECT_ID
```

### Monitoring Metrics

- **Memory Usage**: Monitor for memory leaks
- **CPU Usage**: Watch for AI processing spikes
- **Request Latency**: Track response times
- **Error Rates**: Monitor 4xx/5xx responses

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check build logs
   docker build --no-cache -t veridect:debug .
   ```

2. **Runtime Errors**
   ```bash
   # Check container logs
   docker logs veridect-container
   ```

3. **Memory Issues**
   ```bash
   # Increase memory limit
   docker run --memory=2g veridect:latest
   ```

4. **Database Connection**
   ```bash
   # Test database connectivity
   docker run --rm veridect:latest node -e "console.log(process.env.DATABASE_URL)"
   ```

### Debug Mode

```bash
# Run with debug output
docker run -e DEBUG=* veridect:latest

# Interactive shell
docker run -it --entrypoint /bin/sh veridect:latest
```

## Security Best Practices

### Container Security

- **Non-root Execution**: All processes run as non-root user
- **Read-only Filesystem**: Consider read-only root filesystem
- **Secrets Management**: Use environment variables or secret managers
- **Network Security**: Limit exposed ports

### Production Hardening

```dockerfile
# Additional security measures
RUN apk --no-cache add ca-certificates && \
    apk --no-cache upgrade && \
    rm -rf /var/cache/apk/*

# Set security headers
ENV NODE_ENV=production
ENV SECURE_HEADERS=true
```

## Backup and Recovery

### Database Backups

```bash
# Automated backups with Cloud SQL
gcloud sql backups create --instance=veridect-db

# Manual backup
pg_dump $DATABASE_URL > backup.sql
```

### Container Recovery

```bash
# Rollback to previous version
gcloud run services update veridect \
  --image europe-west1-docker.pkg.dev/$PROJECT_ID/veridect/app:previous-tag
```

This deployment guide ensures secure, scalable, and maintainable container deployment for the Veridect platform.