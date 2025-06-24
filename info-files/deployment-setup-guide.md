# YesNoApp Deployment Setup Guide

## Quick Setup Options

### Option 1: Replit Deployments (Fastest - 15 minutes)
**Best for**: Immediate launch, zero configuration

1. **Deploy directly from current workspace**
   - Click "Deploy" in Replit
   - Choose "Autoscale deployment" 
   - Set custom domain (optional)
   - Add environment variables:
     - `GOOGLE_GEMINI_API_KEY`
     - `STRIPE_SECRET_KEY`
     - `VITE_STRIPE_PUBLIC_KEY`

2. **Production database**
   - Current PostgreSQL works for production
   - Or upgrade to Replit Pro database for higher limits

### Option 2: GitHub + Google Cloud Run (Professional - 2 hours)
**Best for**: Enterprise scaling, full DevOps control

#### Prerequisites
- GitHub account
- Google Cloud Platform account
- Domain name (optional)

#### Step 1: GitHub Repository Setup

1. **Create GitHub repository**
```bash
# In your local terminal (or Replit shell)
git init
git add .
git commit -m "Initial YesNoApp deployment"
git remote add origin https://github.com/yourusername/yesnoapp.git
git push -u origin main
```

2. **Add Dockerfile**
```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
```

3. **Add .dockerignore**
```
node_modules
.git
.env
*.log
coverage
.nyc_output
```

#### Step 2: Google Cloud Setup

1. **Create new project**
   - Go to Google Cloud Console
   - Create new project: "yesnoapp-production"
   - Enable Cloud Run API
   - Enable Cloud SQL API (for database)

2. **Set up Cloud SQL PostgreSQL**
```bash
# Install Google Cloud CLI first
gcloud sql instances create yesnoapp-db \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=us-central1

gcloud sql databases create yesnoapp \
    --instance=yesnoapp-db

gcloud sql users create yesnoapp-user \
    --instance=yesnoapp-db \
    --password=your-secure-password
```

#### Step 3: GitHub Actions CI/CD

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  PROJECT_ID: your-project-id
  GAR_LOCATION: us-central1
  SERVICE: yesnoapp
  REGION: us-central1

jobs:
  deploy:
    permissions:
      contents: read
      id-token: write

    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Google Auth
        id: auth
        uses: 'google-github-actions/auth@v2'
        with:
          credentials_json: '${{ secrets.GCP_SA_KEY }}'

      - name: Docker Auth
        id: docker-auth
        uses: 'docker/login-action@v3'
        with:
          registry: '${{ env.GAR_LOCATION }}-docker.pkg.dev'
          username: _json_key
          password: '${{ secrets.GCP_SA_KEY }}'

      - name: Build and Push Container
        run: |-
          docker build -t "${{ env.GAR_LOCATION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.SERVICE }}/${{ env.SERVICE }}:${{ github.sha }}" ./
          docker push "${{ env.GAR_LOCATION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.SERVICE }}/${{ env.SERVICE }}:${{ github.sha }}"

      - name: Deploy to Cloud Run
        id: deploy
        uses: google-github-actions/deploy-cloudrun@v2
        with:
          service: ${{ env.SERVICE }}
          region: ${{ env.REGION }}
          image: ${{ env.GAR_LOCATION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.SERVICE }}/${{ env.SERVICE }}:${{ github.sha }}
          env_vars: |
            NODE_ENV=production
            DATABASE_URL=${{ secrets.DATABASE_URL }}
            SESSION_SECRET=${{ secrets.SESSION_SECRET }}
            GOOGLE_GEMINI_API_KEY=${{ secrets.GOOGLE_GEMINI_API_KEY }}
            STRIPE_SECRET_KEY=${{ secrets.STRIPE_SECRET_KEY }}
            VITE_STRIPE_PUBLIC_KEY=${{ secrets.VITE_STRIPE_PUBLIC_KEY }}
            GOOGLE_CLIENT_ID=${{ secrets.GOOGLE_CLIENT_ID }}
            GOOGLE_CLIENT_SECRET=${{ secrets.GOOGLE_CLIENT_SECRET }}
            APPLE_SERVICE_ID=${{ secrets.APPLE_SERVICE_ID }}
            APPLE_TEAM_ID=${{ secrets.APPLE_TEAM_ID }}
            APPLE_KEY_ID=${{ secrets.APPLE_KEY_ID }}
            APPLE_PRIVATE_KEY=${{ secrets.APPLE_PRIVATE_KEY }}

      - name: Show Output
        run: echo ${{ steps.deploy.outputs.url }}
```

#### Step 4: Environment Variables Setup

1. **GitHub Secrets** (Settings > Secrets and variables > Actions):
   - `GCP_SA_KEY`: Service account JSON key
   - `DATABASE_URL`: PostgreSQL connection string
   - `SESSION_SECRET`: Random secure string
   - `GOOGLE_GEMINI_API_KEY`: From Google AI Studio
   - `STRIPE_SECRET_KEY`: From Stripe dashboard
   - `VITE_STRIPE_PUBLIC_KEY`: Stripe publishable key

2. **Database connection format**:
```
DATABASE_URL=postgresql://yesnoapp-user:password@/yesnoapp?host=/cloudsql/project-id:us-central1:yesnoapp-db
```

#### Step 5: Deploy

1. **Push to GitHub**
```bash
git add .
git commit -m "Add Cloud Run deployment"
git push origin main
```

2. **Monitor deployment**
   - Go to GitHub Actions tab
   - Watch deployment progress
   - Get deployed URL from action output

### Option 3: Railway (Simple Alternative)

1. **Connect GitHub repository**
   - Go to railway.app
   - Connect GitHub account
   - Deploy from repository

2. **Add environment variables**
   - Same variables as Cloud Run setup
   - Railway provides PostgreSQL automatically

3. **Deploy**
   - Automatic deployment on git push
   - Custom domain available

## API Keys Required

### Google Gemini AI
1. Go to Google AI Studio (ai.google.dev)
2. Create API key
3. Add to environment as `GOOGLE_GEMINI_API_KEY`

### Stripe Payment Processing
1. Go to Stripe Dashboard (dashboard.stripe.com)
2. Get API keys from Developers > API keys
3. Add secret key as `STRIPE_SECRET_KEY`
4. Add publishable key as `VITE_STRIPE_PUBLIC_KEY`

### Optional: SendGrid Email
1. Create SendGrid account
2. Get API key
3. Add as `SENDGRID_API_KEY`

## Production Checklist

### Security
- [ ] All API keys in environment variables
- [ ] Database password secure
- [ ] HTTPS enabled
- [ ] Session secret randomized

### Performance
- [ ] Database indexes optimized
- [ ] Image compression enabled
- [ ] CDN configured (automatic with Cloud Run)
- [ ] Monitoring enabled

### Features
- [ ] Google Gemini AI working
- [ ] Stripe payments functional
- [ ] Email notifications working
- [ ] GDPR compliance active

### Testing
- [ ] User registration/login
- [ ] Food analysis with camera
- [ ] Payment flow end-to-end
- [ ] Mobile responsiveness
- [ ] Weekly leaderboard updates

## Mobile App Store Preparation

### Android (Google Play)
1. **App Signing**
   - Generate upload key
   - Enable Google Play App Signing

2. **Store Listing**
   - App name: "YesNoApp - Smart Food Analysis"
   - Description highlighting AI features
   - Screenshots for different device sizes
   - Privacy policy URL

3. **Permissions Justification**
   - Camera: "Food photography for AI analysis"
   - Health data: "Sync nutrition data with Google Fit"

### iOS (Apple App Store)
1. **App Store Connect**
   - Create app record
   - Upload build via Xcode
   - Add App Store screenshots

2. **Health Data Justification**
   - Explain HealthKit integration
   - Show nutrition data sync benefits

3. **Review Guidelines**
   - Ensure AI disclaimer is prominent
   - Medical advice limitations clear

## Scaling Considerations

### Database
- **Free tier**: Up to 1,000 users
- **Pro tier**: Up to 100,000 users
- **Enterprise**: Unlimited with read replicas

### AI API Costs
- Google Gemini: ~$0.01 per analysis
- Budget for 50,000 analyses/month = $500
- Implement rate limiting for free users

### Infrastructure
- Cloud Run: Auto-scales from 0 to 1000+ instances
- Railway/Replit: Fixed pricing with good scaling

This setup gives you production-ready deployment with professional infrastructure that can scale from launch to millions of users.