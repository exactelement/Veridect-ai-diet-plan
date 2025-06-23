# Deploy YesNoApp to Google Cloud Run

## Quick Deployment Steps

### 1. Install Google Cloud SDK (one-time setup)
```bash
# Install Google Cloud SDK
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud auth login
```

### 2. Set up Google Cloud Project
```bash
# Create or select project
gcloud projects create yesnoapp-production --name="YesNoApp Production"
gcloud config set project yesnoapp-production

# Enable billing (required for Cloud Run)
# Go to: https://console.cloud.google.com/billing

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 3. Deploy with Automated Script
Your app includes a complete deployment script:

```bash
chmod +x deploy-to-gcp.sh
./deploy-to-gcp.sh
```

This script will:
- Build Docker container
- Push to Google Container Registry  
- Deploy to Cloud Run with auto-scaling
- Set up environment variables
- Configure custom domain (optional)

### 4. Set Environment Variables
The deployment will prompt you to configure:

**Required Secrets:**
- `DATABASE_URL` - Your PostgreSQL connection string
- `SESSION_SECRET` - Random secure string
- `GOOGLE_CLIENT_ID` - From Google OAuth Console
- `GOOGLE_CLIENT_SECRET` - From Google OAuth Console  
- `APPLE_SERVICE_ID` - From Apple Developer Portal
- `APPLE_TEAM_ID` - From Apple Developer Portal
- `APPLE_KEY_ID` - From Apple Developer Portal
- `APPLE_PRIVATE_KEY` - From Apple Developer Portal

**Optional Services:**
- `GEMINI_API_KEY` - For AI food analysis
- `STRIPE_SECRET_KEY` - For subscription payments
- `SENDGRID_API_KEY` - For email notifications

### 5. Configure OAuth Providers

**Google OAuth Console:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Add authorized redirect URI: `https://your-service-url/api/auth/google/callback`
3. Add authorized JavaScript origin: `https://your-service-url`

**Apple Developer Portal:**
1. Go to [Apple Developer](https://developer.apple.com/account/resources/identifiers/list/serviceId)
2. Configure return URLs with your Cloud Run service URL

### 6. Database Setup
Your app uses PostgreSQL. Options:

**Option A: Google Cloud SQL**
```bash
# Create Cloud SQL instance
gcloud sql instances create yesnoapp-db \
    --database-version=POSTGRES_14 \
    --tier=db-f1-micro \
    --region=us-central1

# Create database
gcloud sql databases create yesnoapp --instance=yesnoapp-db
```

**Option B: External Database (Neon, Supabase, etc.)**
- Use your existing DATABASE_URL
- Ensure it's accessible from Cloud Run

### 7. Custom Domain (Optional)
```bash
# Map custom domain
gcloud run domain-mappings create \
    --service yesnoapp \
    --domain yourdomain.com \
    --region us-central1
```

## After Deployment

Your app will be available at: `https://yesnoapp-[hash]-uc.a.run.app`

**Next Steps:**
1. Update OAuth redirect URIs with the Cloud Run URL
2. Test authentication and core functionality
3. Set up monitoring and logging
4. Configure custom domain if desired

## Deployment Commands Summary

```bash
# One-time setup
gcloud auth login
gcloud config set project yesnoapp-production

# Deploy (run from project root)
./deploy-to-gcp.sh

# View service details
gcloud run services describe yesnoapp --region=us-central1

# View logs
gcloud logs read --service=yesnoapp --limit=50
```

The deployment script handles Docker building, container registry, and Cloud Run configuration automatically.