# Corrected Deployment Commands

## Run these commands in order from your DocumentNavigator-deploy-3 directory:

```bash
# 1. Install missing dependencies
npm install @stripe/react-stripe-js @stripe/stripe-js

# 2. Replace subscription file with clean version (using the file I just created)
cp subscription-clean.tsx client/src/pages/subscription.tsx

# 3. Build the application
npm run build

# 4. Build Docker image
docker build -t gcr.io/veridect-fixed/veridect .

# 5. Push to Google Container Registry
docker push gcr.io/veridect-fixed/veridect

# 6. Deploy to Cloud Run
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

# 8. Clean up temporary file
rm subscription-clean.tsx
```

## Expected Result
After step 7, you'll get your live Veridect URL like:
`https://veridect-app-xxx-ey.a.run.app`

The application will be fully functional with all features working.