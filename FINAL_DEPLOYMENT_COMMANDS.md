# Final Deployment Commands

## Prerequisites Check
1. Docker Desktop is running (green whale icon)
2. You're in the `DocumentNavigator-deploy-2` directory
3. You can see `package.json` and `Dockerfile` when you run `ls`

## Run These Commands in Order

```bash
# 1. Install missing dependencies
npm install @stripe/react-stripe-js @stripe/stripe-js

# 2. Replace subscription file with deployment-ready version
cp client/src/pages/subscription-deploy.tsx client/src/pages/subscription.tsx

# 3. Build the application
npm run build

# 4. Build Docker image
docker build -t gcr.io/veridect-fixed/veridect .

# 5. Push to Google Container Registry
docker push gcr.io/veridect-fixed/veridect

# 6. Deploy to Cloud Run (update existing service)
gcloud run deploy veridect-app \
  --image gcr.io/veridect-fixed/veridect \
  --region europe-west1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi

# 7. Get your live URL
gcloud run services describe veridect-app \
  --region europe-west1 \
  --format="value(status.url)"
```

## Expected Output
After step 7, you'll get a URL like:
```
https://veridect-app-xxx-ey.a.run.app
```

This will be your live Veridect application with all features working.