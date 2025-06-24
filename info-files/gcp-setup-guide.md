# GCP Setup Guide for YesNoApp Deployment

## Prerequisites Installation

### 1. Install Google Cloud SDK

**macOS:**
```bash
brew install google-cloud-sdk
```

**Linux/WSL:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

**Windows:**
Download and run the installer from [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)

### 2. Install Docker

**macOS:**
```bash
brew install docker
# Or download Docker Desktop
```

**Linux:**
```bash
sudo apt update
sudo apt install docker.io
sudo usermod -aG docker $USER
```

### 3. Initialize Google Cloud

```bash
# Login to Google Cloud
gcloud auth login

# Set up application default credentials
gcloud auth application-default login

# Create or select project
gcloud projects create yesnoapp-production
gcloud config set project yesnoapp-production

# Enable billing (required for Cloud Run)
# You'll need to do this in the web console
```

## Step 2: Get Required API Keys

### Google Gemini AI API Key

1. Go to [Google AI Studio](https://ai.google.dev)
2. Click "Get API Key"
3. Create new project or select existing
4. Copy the API key (starts with `AIza...`)

### Stripe API Keys (Optional)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy both keys:
   - Secret key (starts with `sk_`)
   - Publishable key (starts with `pk_`)

### Apple Developer Credentials (Optional)

1. Go to [Apple Developer Console](https://developer.apple.com/account/)
2. Create a Service ID:
   - Navigate to "Certificates, Identifiers & Profiles"
   - Click "Identifiers" → "+" → "Services IDs"
   - Register a new Service ID (e.g., `com.yesnoapp.signin`)
3. Configure Sign In with Apple:
   - Enable "Sign In with Apple" for your Service ID
   - Add your domains (both development and production)
4. Create a Key:
   - Go to "Keys" → "+" 
   - Enable "Sign In with Apple"
   - Download the private key (.p8 file)
5. Collect required values:
   - Service ID (e.g., `com.yesnoapp.signin`)
   - Team ID (found in membership details)
   - Key ID (from the key you created)
   - Private Key (contents of the .p8 file)

## Step 3: Deploy to GCP

### Option A: Automated Deployment (Recommended)

```bash
# Download your project files
git clone your-project-repo
cd yesnoapp

# Make deployment script executable
chmod +x deploy-to-gcp.sh

# Run deployment
./deploy-to-gcp.sh
```

### Option B: Manual Deployment

```bash
# Set variables
PROJECT_ID="yesnoapp-production"
REGION="us-central1"
SERVICE_NAME="yesnoapp"

# Enable APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# Create repository
gcloud artifacts repositories create yesnoapp-repo \
    --repository-format=docker \
    --location=$REGION

# Configure Docker
gcloud auth configure-docker us-central1-docker.pkg.dev

# Build and push
docker build -t us-central1-docker.pkg.dev/$PROJECT_ID/yesnoapp-repo/yesnoapp:latest .
docker push us-central1-docker.pkg.dev/$PROJECT_ID/yesnoapp-repo/yesnoapp:latest

# Deploy to Cloud Run
gcloud run deploy yesnoapp \
    --image=us-central1-docker.pkg.dev/$PROJECT_ID/yesnoapp-repo/yesnoapp:latest \
    --region=$REGION \
    --allow-unauthenticated \
    --memory=2Gi \
    --cpu=2 \
    --port=8080
```

## Step 4: Configure Secrets

```bash
# Add your API keys to Secret Manager
echo "your_actual_gemini_api_key" | gcloud secrets create GOOGLE_GEMINI_API_KEY --data-file=-
echo "your_stripe_secret_key" | gcloud secrets create STRIPE_SECRET_KEY --data-file=-
echo "your_stripe_public_key" | gcloud secrets create VITE_STRIPE_PUBLIC_KEY --data-file=-

# Add Google OAuth credentials
echo "your_google_client_id" | gcloud secrets create GOOGLE_CLIENT_ID --data-file=-
echo "your_google_client_secret" | gcloud secrets create GOOGLE_CLIENT_SECRET --data-file=-

# Add Apple Sign-In credentials (if using Apple authentication)
echo "com.yesnoapp.signin" | gcloud secrets create APPLE_SERVICE_ID --data-file=-
echo "your_team_id" | gcloud secrets create APPLE_TEAM_ID --data-file=-
echo "your_key_id" | gcloud secrets create APPLE_KEY_ID --data-file=-
echo "-----BEGIN PRIVATE KEY-----
your_private_key_contents
-----END PRIVATE KEY-----" | gcloud secrets create APPLE_PRIVATE_KEY --data-file=-

# Generate session secret
openssl rand -base64 32 | gcloud secrets create SESSION_SECRET --data-file=-

# Create database URL (after setting up Cloud SQL)
echo "postgresql://username:password@localhost/yesnoapp?host=/cloudsql/PROJECT:REGION:INSTANCE" | \
gcloud secrets create DATABASE_URL --data-file=-

# Update Cloud Run service with secrets
gcloud run services update yesnoapp \
    --region=us-central1 \
    --set-secrets=GOOGLE_GEMINI_API_KEY=GOOGLE_GEMINI_API_KEY:latest \
    --set-secrets=STRIPE_SECRET_KEY=STRIPE_SECRET_KEY:latest \
    --set-secrets=SESSION_SECRET=SESSION_SECRET:latest \
    --set-secrets=DATABASE_URL=DATABASE_URL:latest
```

## Step 5: Set Up Database

```bash
# Create Cloud SQL instance
gcloud sql instances create yesnoapp-db \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=us-central1

# Create database
gcloud sql databases create yesnoapp --instance=yesnoapp-db

# Create user
gcloud sql users create yesnoapp-user \
    --instance=yesnoapp-db \
    --password=YOUR_SECURE_PASSWORD

# Connect Cloud Run to database
gcloud run services update yesnoapp \
    --region=us-central1 \
    --add-cloudsql-instances=yesnoapp-production:us-central1:yesnoapp-db
```

## Step 6: Custom Domain (Optional)

```bash
# Map custom domain
gcloud run domain-mappings create \
    --service=yesnoapp \
    --domain=yourdomain.com \
    --region=us-central1

# Update DNS records as instructed
```

## Step 7: Monitoring and Scaling

```bash
# View logs
gcloud run services logs read yesnoapp --region=us-central1

# Update scaling
gcloud run services update yesnoapp \
    --region=us-central1 \
    --min-instances=1 \
    --max-instances=50

# Check status
gcloud run services describe yesnoapp --region=us-central1
```

## Troubleshooting

### Common Issues

**Build Errors:**
- Ensure Docker is running
- Check Dockerfile syntax
- Verify all dependencies in package.json

**Database Connection:**
- Verify Cloud SQL instance is running
- Check connection string format
- Ensure service account has SQL client role

**Secrets Not Loading:**
- Verify secrets exist: `gcloud secrets list`
- Check service account permissions
- Ensure latest secret versions are used

### Get Help

```bash
# Check service logs
gcloud run services logs read yesnoapp --region=us-central1 --limit=50

# Debug deployment
gcloud run revisions list --service=yesnoapp --region=us-central1

# Test locally
docker run -p 8080:8080 -e NODE_ENV=production your-image
```

## Success Indicators

After deployment, you should see:
- ✅ Service URL accessible
- ✅ Health check passing
- ✅ Database connections working
- ✅ API endpoints responding
- ✅ Food analysis functioning

Your app will be live at: `https://yesnoapp-xxx.run.app`