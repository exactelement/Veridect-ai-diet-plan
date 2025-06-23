# Fix for Deployment Issues

## Problem 1: Stripe Import Error
Your local subscription.tsx file still has Stripe imports that aren't installed.

**Quick Fix:**
Replace your `client/src/pages/subscription.tsx` with the clean version from `client/src/pages/subscription-deploy.tsx` (I just created this file without Stripe imports).

```bash
# From your project directory
cp client/src/pages/subscription-deploy.tsx client/src/pages/subscription.tsx
```

## Problem 2: Docker Not Running
You need to start Docker Desktop on your Mac.

**Fix:**
1. Open **Docker Desktop** application on your Mac
2. Wait for it to fully start (Docker icon in menu bar should be stable)
3. Verify it's running: `docker --version`

## Problem 3: Missing Dependencies
Install the Stripe packages in your local environment:

```bash
npm install @stripe/react-stripe-js @stripe/stripe-js
```

## Quick Deployment Commands (After Fixes)

```bash
# 1. Start Docker Desktop first, then:
export PROJECT_ID="veridect-fixed"  # I see you already have this project

# 2. Build application
npm run build

# 3. Build and push Docker image
docker build -t gcr.io/$PROJECT_ID/veridect .
docker push gcr.io/$PROJECT_ID/veridect

# 4. Deploy to Cloud Run
gcloud run deploy veridect-app \
  --image gcr.io/$PROJECT_ID/veridect \
  --region europe-west1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi

# 5. Get your URL
gcloud run services describe veridect-app --region europe-west1 --format="value(status.url)"
```

Your deployment already started but failed at the Docker step. Once you fix these issues, it should deploy successfully to your `veridect-fixed` project.