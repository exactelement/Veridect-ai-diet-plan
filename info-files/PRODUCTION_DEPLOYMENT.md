# Veridect Production Deployment Guide
## ⚠️ PATENT NOTICE
**Do not deploy publicly until Spanish patent application is filed**
This deployment guide is prepared for post-patent filing launch.

## Prerequisites
- Google Cloud Platform account with billing enabled
- gcloud CLI installed and authenticated
- Project with Container Registry and Cloud Run APIs enabled

## Deployment Steps

### 1. Set Environment Variables
```bash
export PROJECT_ID="your-project-id"
export REGION="europe-west1"
```

### 2. Build Production Assets
```bash
npm run build
```

### 3. Deploy to Cloud Run
```bash
./deploy-cloudrun.sh
```

## Environment Variables Required
Set these in Cloud Run service configuration:

### Database
- `DATABASE_URL` - PostgreSQL connection string
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`

### Authentication
- `SESSION_SECRET` - Session encryption key
- `REPLIT_DOMAINS` - Your production domain
- `ISSUER_URL` - Replit OIDC issuer (default: https://replit.com/oidc)

### AI Services
- `GOOGLE_API_KEY` - Google Gemini API key for food analysis

### Optional Services
- `STRIPE_SECRET_KEY` - For subscription payments
- `STRIPE_PUBLIC_KEY` - Client-side Stripe key
- `SENDGRID_API_KEY` - For email notifications

## Cloud Run Configuration
- **Memory**: 2Gi
- **CPU**: 2 vCPU
- **Concurrency**: 1000
- **Min Instances**: 0
- **Max Instances**: 20
- **Port**: 8080
- **Timeout**: 300 seconds

## Health Check
The application provides a health endpoint at `/health` that returns:
```json
{"status": "healthy", "timestamp": "2025-06-24T01:00:00.000Z"}
```

## Database Migration
Ensure your production database schema is up to date:
```bash
npm run db:push
```

## Monitoring
- Application logs: `gcloud logs tail --service=veridect`
- Error reporting available in Google Cloud Console
- Health checks monitor application availability

## Security Features
- Non-root container execution
- Session-based authentication with PostgreSQL storage
- HTTPS enforced by Cloud Run
- Environment variable encryption
- CORS configuration for production domains

## Post-Deployment Verification
1. Check health endpoint: `curl https://your-app-url/health`
2. Verify authentication flow works
3. Test food analysis functionality
4. Confirm challenge system operates correctly
5. Validate point tracking and badge awards

## Scaling Configuration
Cloud Run automatically scales based on:
- CPU utilization
- Memory usage
- Request concurrency
- Custom metrics (if configured)

The application is optimized for:
- Fast cold starts (< 2 seconds)
- Efficient memory usage
- Concurrent request handling
- AI processing workloads