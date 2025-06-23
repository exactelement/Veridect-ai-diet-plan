# Veridect Cloud Run Deployment - Step by Step

## Copy These Commands to Your Terminal

Since you have Google Cloud SDK installed, run these commands one by one:

### 1. Set Your Project ID
```bash
export PROJECT_ID="your-actual-project-id"
```
Replace `your-actual-project-id` with your Google Cloud project ID.

### 2. Authenticate and Configure
```bash
gcloud auth login
gcloud config set project $PROJECT_ID
```

### 3. Enable Required APIs
```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com  
gcloud services enable containerregistry.googleapis.com
```

### 4. Configure Docker
```bash
gcloud auth configure-docker
```

### 5. Build the Application
```bash
npm run build
```

### 6. Build and Push Docker Image
```bash
docker build -t gcr.io/$PROJECT_ID/veridect .
docker push gcr.io/$PROJECT_ID/veridect
```

### 7. Deploy to Cloud Run
```bash
gcloud run deploy veridect-app \
  --image gcr.io/$PROJECT_ID/veridect \
  --region europe-west1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 10 \
  --set-env-vars NODE_ENV=production,PORT=8080
```

### 8. Get Your Live URL
```bash
gcloud run services describe veridect-app \
  --region europe-west1 \
  --format="value(status.url)"
```

## Expected Result
You'll get a URL like: `https://veridect-app-xxx-ey.a.run.app`

## Total Time
5-10 minutes depending on your internet speed.

## Next Steps After Deployment
1. Set environment variables for database and API keys
2. Test the application
3. Configure custom domain (optional)

The application will work without environment variables, but some features (like AI analysis) will need API keys to be fully functional.