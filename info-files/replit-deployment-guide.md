# YesNoApp Replit Deployment Guide

## Overview

This guide covers deploying your YesNoApp directly from Replit with zero configuration. This is the fastest path to production for your food analysis platform.

## Prerequisites

- YesNoApp development complete in Replit workspace
- Google Gemini AI API key
- Stripe API keys (for payment processing)
- Domain name (optional, Replit provides free subdomain)

## Step 1: Environment Variables Setup

### Required API Keys

1. **Google Gemini AI** (for food analysis)
   - Go to [Google AI Studio](https://ai.google.dev)
   - Create new API key
   - Copy the key (starts with `AIza...`)

2. **Stripe Payment Processing**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com)
   - Navigate to Developers → API keys
   - Copy both keys:
     - Secret key (starts with `sk_`)
     - Publishable key (starts with `pk_`)

### Add Environment Variables to Replit

1. Click "Secrets" tab in your Replit workspace
2. Add these environment variables:

```
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
VITE_STRIPE_PUBLIC_KEY=your_stripe_publishable_key_here
SESSION_SECRET=generate_random_32_character_string
NODE_ENV=production
```

**Generate SESSION_SECRET:**
```bash
# Run this in Replit Shell to generate secure session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 2: Database Configuration

Your PostgreSQL database is already configured and ready for production. No additional setup needed.

**Verify database connection:**
```bash
# Test database in Replit Shell
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

## Step 3: Deploy to Production

### Option A: Autoscale Deployment (Recommended)

1. Click "Deploy" button in your Replit workspace
2. Choose "Autoscale deployment"
3. Configure deployment:
   - **Name**: `yesnoapp-production`
   - **Description**: `AI-powered food analysis platform`
   - **Build command**: `npm run build`
   - **Run command**: `npm start`
   - **Root directory**: `/` (default)

4. Click "Deploy" and wait for build completion

### Option B: Static Deployment

1. Click "Deploy" button
2. Choose "Static deployment" 
3. Configure:
   - **Build directory**: `dist`
   - **Build command**: `npm run build`

**Note:** Use Autoscale for full-stack functionality including API endpoints.

## Step 4: Domain Configuration

### Free Replit Domain
Your app will be available at: `https://your-repl-name.your-username.replit.app`

### Custom Domain (Optional)
1. Go to deployment settings
2. Click "Add custom domain"
3. Enter your domain (e.g., `yesnoapp.com`)
4. Update DNS records as instructed:
   ```
   Type: CNAME
   Name: @ (or www)
   Value: your-repl-name.your-username.replit.app
   ```

## Step 5: Production Verification

### Test Core Features

1. **User Authentication**
   - Register new account
   - Login/logout functionality
   - Password reset flow

2. **Food Analysis**
   - Camera-based analysis
   - Image upload analysis
   - Text description analysis
   - Verify AI responses are accurate

3. **Gamification System**
   - Points awarding (YES=10, OK=5, NO=2)
   - Streak tracking
   - Level progression
   - Weekly leaderboard updates

4. **Payment Processing**
   - Test subscription signup
   - Verify Stripe webhook handling
   - Confirm tier-based feature access

5. **GDPR Compliance**
   - Privacy banner functionality
   - Data export/deletion options
   - Consent management

### Performance Testing

```bash
# Test API response times
curl -w "@curl-format.txt" -o /dev/null -s "https://your-domain.com/api/auth/user"

# Monitor database performance
psql $DATABASE_URL -c "SELECT COUNT(*) as total_users, 
  COUNT(CASE WHEN onboarding_completed = true THEN 1 END) as active_users 
  FROM users;"
```

## Step 6: Monitoring and Scaling

### Built-in Monitoring

Replit provides automatic monitoring:
- Request/response metrics
- Error rate tracking
- Resource usage analytics
- Uptime monitoring

### Scaling Configuration

**Autoscale settings:**
- **Min instances**: 0 (cost-effective)
- **Max instances**: 10 (handles traffic spikes)
- **CPU threshold**: 70% (good balance)
- **Memory threshold**: 80%

### Database Scaling

For high traffic (1000+ concurrent users):
1. Upgrade to Replit Pro database
2. Enable connection pooling
3. Add database read replicas if needed

## Step 7: SSL and Security

### Automatic HTTPS
Replit provides automatic SSL certificates for all deployments.

### Security Headers
Add to your Express app:

```javascript
// Add to server/index.ts
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

## Step 8: Launch Checklist

### Pre-Launch Verification

- [ ] All environment variables configured
- [ ] Database migrations complete
- [ ] API endpoints responding correctly
- [ ] Frontend builds without errors
- [ ] Payment processing functional
- [ ] Email notifications working (if using SendGrid)
- [ ] GDPR compliance active
- [ ] Mobile responsiveness verified

### Launch Day Tasks

1. **Announce Launch**
   - Share deployment URL
   - Post on social media
   - Email early users

2. **Monitor Performance**
   - Watch error logs in Replit console
   - Monitor database connection count
   - Track user registration rates

3. **Scale as Needed**
   - Increase max instances if traffic spikes
   - Monitor API response times
   - Check database performance

## Step 9: Post-Launch Optimization

### Performance Monitoring

```bash
# Check deployment health
curl https://your-domain.com/api/health

# Monitor database connections
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"
```

### Analytics Integration

Add Google Analytics to track user behavior:
1. Get Google Analytics tracking ID
2. Add to environment variables: `VITE_GA_MEASUREMENT_ID`
3. Analytics will automatically start tracking

### Backup Strategy

Replit automatically backs up your database, but for additional safety:
1. Set up automated database exports
2. Store backup files in cloud storage
3. Test restoration process monthly

## Troubleshooting Common Issues

### Build Failures
```bash
# Clear npm cache and rebuild
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Database Connection Issues
```bash
# Test database connectivity
psql $DATABASE_URL -c "SELECT version();"

# Reset database connection pool
# Restart deployment if needed
```

### API Key Issues
- Verify all keys are correctly added to Secrets
- Check for extra spaces or characters
- Ensure keys have proper permissions in respective services

## Cost Estimation

### Replit Pricing (as of 2024)
- **Cycles usage**: ~1000 cycles/month for moderate traffic
- **Database**: Included with workspace
- **Bandwidth**: Generous limits included
- **Custom domain**: Free

### External Services
- **Google Gemini AI**: ~$0.01 per analysis
- **Stripe**: 2.9% + $0.30 per transaction
- **Domain**: $10-15/year (optional)

**Total monthly cost for 1000 users**: $50-100

This deployment approach gives you production-ready hosting with automatic scaling, SSL, monitoring, and zero DevOps overhead - perfect for launching and growing your food analysis platform.