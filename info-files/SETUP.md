# Veridect Setup Guide

## Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create a `.env` file in the root directory:
```env
# Database (Required)
DATABASE_URL=your_postgresql_connection_string

# AI Analysis (Required for food analysis)
GOOGLE_GEMINI_API_KEY=your_gemini_api_key

# Authentication (Required)
SESSION_SECRET=your_random_session_secret_key

# Replit Auth Configuration (Automatic in Replit environment)
REPLIT_DOMAINS=your-repl-domain.replit.dev
REPL_ID=your_repl_id
ISSUER_URL=https://replit.com/oidc

# Optional: Payment Processing
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key

# Email Services (Required for password reset)
SENDGRID_API_KEY=your_sendgrid_api_key

# Optional: Analytics
VITE_GA_MEASUREMENT_ID=your_google_analytics_id
```

### 3. Set Up Database
```bash
# Push database schema
npm run db:push
```

### 4. Start Development Server
```bash
npm run dev
```

Your app will be available at `http://localhost:5000`

## Environment Setup Details

### Database Setup (PostgreSQL)
You need a PostgreSQL database. Options:

**Option 1: Free PostgreSQL on Railway**
1. Go to https://railway.app
2. Create new project → Add PostgreSQL
3. Copy the DATABASE_URL from the Connect tab

**Option 2: Free PostgreSQL on Neon**
1. Go to https://neon.tech
2. Create new project
3. Copy the connection string

**Option 3: Local PostgreSQL**
```bash
# Install PostgreSQL locally
# macOS: brew install postgresql
# Ubuntu: sudo apt install postgresql

# Start PostgreSQL service
# macOS: brew services start postgresql
# Ubuntu: sudo systemctl start postgresql

# Create database
createdb yesnoapp
```

### Google Gemini API Key
1. Go to https://makersuite.google.com/app/apikey
2. Create new API key
3. Copy the key (starts with `AIza...`)

### Session Secret
Generate a random string for session security:
```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Multi-Provider Authentication Setup (Optional)

**Google OAuth Setup:**
1. Go to https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID for Web application
3. Add authorized redirect URI: `https://yourdomain.com/api/auth/google/callback`
4. Copy Client ID → GOOGLE_CLIENT_ID
5. Copy Client Secret → GOOGLE_CLIENT_SECRET

**Apple Sign-In Setup:**
1. Go to https://developer.apple.com/account/resources/identifiers/list/serviceId
2. Create new Services ID with your domain
3. Configure Sign In with Apple for your Service ID
4. Generate private key in Keys section
5. Set the environment variables:
   - APPLE_SERVICE_ID: Your Services ID
   - APPLE_TEAM_ID: Your Team ID (from membership details)
   - APPLE_KEY_ID: Your private key ID
   - APPLE_PRIVATE_KEY: Private key content (including headers)

### Optional: Stripe Setup (for subscriptions)
1. Go to https://dashboard.stripe.com/apikeys
2. Copy "Publishable key" → VITE_STRIPE_PUBLIC_KEY
3. Copy "Secret key" → STRIPE_SECRET_KEY

### Optional: SendGrid Setup (for emails)
1. Go to https://app.sendgrid.com/settings/api_keys
2. Create new API key
3. Copy the key

## Common Issues & Solutions

### Issue: "npm install" fails
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: Database connection fails
**Solutions:**
1. Verify DATABASE_URL format: `postgresql://username:password@host:port/database`
2. Check if database exists and is accessible
3. Ensure IP whitelist includes your IP (for cloud databases)

### Issue: "npm run dev" fails
**Solutions:**
1. Check all required environment variables are set
2. Ensure port 5000 is available
3. Run `npm run db:push` to sync database schema

### Issue: Food analysis not working
**Solutions:**
1. Verify GOOGLE_GEMINI_API_KEY is correct
2. Check API key has sufficient quota
3. Test with simple food names first

## Project Structure
```
yesnoapp/
├── client/           # React frontend
├── server/           # Express backend
├── shared/           # Shared types/schemas
├── package.json      # Dependencies
├── .env             # Environment variables (create this)
├── drizzle.config.ts # Database configuration
└── SETUP.md         # This file
```

## Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Database operations
npm run db:push      # Push schema changes
npm run db:studio    # Open database viewer

# Type checking
npm run type-check
```

## Production Deployment

### Deploy to Replit
1. Import this project to Replit
2. Add environment variables in Secrets tab
3. Run `npm run dev`
4. Click Deploy button

### Deploy to Other Platforms
1. Build the project: `npm run build`
2. Set environment variables on your platform
3. Run the built application

## Support
If you encounter issues:
1. Check this SETUP.md file
2. Verify all environment variables are correct
3. Check the console for error messages
4. Ensure database is accessible

## Features Included
- ✅ Multi-provider authentication (Google, Apple, Replit, email/password)
- ✅ AI-powered food analysis with personalized verdicts
- ✅ Gamification system with points and leaderboards
- ✅ GDPR compliance with consent management
- ✅ Subscription management with Stripe
- ✅ Password recovery system
- ✅ Mobile-responsive design
- ✅ PostgreSQL database integration