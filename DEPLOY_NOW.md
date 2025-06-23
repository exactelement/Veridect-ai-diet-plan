# Deploy Veridect to Cloud Run Now

## Quick Commands (Copy & Paste)

Run these commands in your terminal from the project directory:

```bash
# 1. Set your Google Cloud project ID
export PROJECT_ID="your-project-id-here"

# 2. Authenticate and configure
gcloud auth login
gcloud config set project $PROJECT_ID

# 3. Enable APIs
gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com

# 4. Configure Docker
gcloud auth configure-docker

# 5. Build application
npm run build

# 6. Build and push Docker image
docker build -t gcr.io/$PROJECT_ID/veridect .
docker push gcr.io/$PROJECT_ID/veridect

# 7. Deploy to Cloud Run
gcloud run deploy veridect-app \
  --image gcr.io/$PROJECT_ID/veridect \
  --region europe-west1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi

# 8. Get your live URL
gcloud run services describe veridect-app --region europe-west1 --format="value(status.url)"
```

## What You'll Get
- Live Veridect app at `https://veridect-app-xxx.a.run.app`
- Full food analysis interface
- User authentication
- Multi-language translation
- All features working (Stripe payments marked as "coming soon")

## Time: 5-10 minutes
Total deployment time including build and push.