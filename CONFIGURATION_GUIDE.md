# Veridect Configuration Guide

## Environment Configuration

### Required Environment Variables

#### Database Configuration
```bash
DATABASE_URL="postgresql://username:password@host:5432/database"
PGDATABASE="veridect_db"
PGHOST="your-database-host"
PGPASSWORD="your-database-password" 
PGPORT="5432"
PGUSER="your-database-user"
```

#### Authentication (Replit Auth)
```bash
SESSION_SECRET="your-secure-session-secret-minimum-32-chars"
REPL_ID="your-replit-app-id"
REPLIT_DOMAINS="your-app-name.replit.dev"
ISSUER_URL="https://replit.com/oidc"
```

#### AI Services
```bash
GOOGLE_GEMINI_API_KEY="your-gemini-api-key"
```

#### Payment Processing (Optional)
```bash
STRIPE_SECRET_KEY="sk_test_or_live_your_stripe_secret"
VITE_STRIPE_PUBLIC_KEY="pk_test_or_live_your_stripe_public"
STRIPE_PRICE_ID="price_your_subscription_price_id"
```

### Client-Side Environment Variables

All client-side environment variables must be prefixed with `VITE_`:

```bash
VITE_STRIPE_PUBLIC_KEY="pk_test_your_stripe_public_key"
```

## Application Configuration

### Translation System

**Default Configuration:**
```typescript
// Automatic configuration - no manual setup required
const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  // ... 20+ languages
];
```

**Storage Configuration:**
- Language preference: `localStorage['veridect-language']`
- Translation cache: `localStorage['veridect-translations']`
- Cache limit: Browser localStorage limit (~5MB)

**API Configuration:**
- Service: MyMemory Translation API (free tier)
- Rate limit: Built-in delays (100ms between batches)
- Batch size: 10 text nodes per request
- Fallback: Original text on API failure

### Database Schema Configuration

**Core Tables:**
```sql
-- Users table (required for Replit Auth)
CREATE TABLE users (
  id VARCHAR PRIMARY KEY,
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sessions table (required for Replit Auth)
CREATE TABLE sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

-- Food logs table
CREATE TABLE food_logs (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id),
  food_name VARCHAR NOT NULL,
  verdict VARCHAR NOT NULL CHECK (verdict IN ('YES', 'NO', 'OK')),
  explanation TEXT,
  calories INTEGER,
  protein REAL,
  confidence REAL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Weekly scores table
CREATE TABLE weekly_scores (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id),
  score INTEGER DEFAULT 0,
  week_start DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Subscription Configuration

**Pricing Tiers:**
```typescript
const SUBSCRIPTION_TIERS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'EUR',
    features: ['5 analyses per day', 'Basic nutritional info'],
    limits: { daily_analyses: 5 }
  },
  {
    id: 'pro', 
    name: 'Pro',
    price: 19.99,
    currency: 'EUR',
    features: ['Unlimited analyses', 'Detailed nutrition', 'Progress tracking'],
    limits: { daily_analyses: -1 } // unlimited
  },
  {
    id: 'medical',
    name: 'Medical',
    price: 49.99,
    currency: 'EUR', 
    features: ['Professional guidance', 'Medical reports', 'Priority support'],
    limits: { daily_analyses: -1 } // unlimited
  }
];
```

### Point System Configuration

**Point Values:**
```typescript
const POINT_VALUES = {
  YES: 10,    // Healthy food choice
  OK: 5,      // Acceptable food choice  
  NO: 2       // Unhealthy food choice
};

const BONUS_POINTS = {
  first_analysis: 50,
  milestone_5: 25,
  milestone_10: 50,
  milestone_25: 100,
  daily_streak: 10,   // per day
  weekly_streak: 50   // per week
};

const LEVEL_SYSTEM = {
  points_per_level: 1000,
  max_level: 100
};
```

### Weekly Challenge Configuration

**Challenge Schedule:**
```typescript
const WEEKLY_CHALLENGE = {
  reset_day: 'monday',        // 0 = Sunday, 1 = Monday
  reset_time: '00:00',        // 24-hour format
  timezone: 'Europe/Madrid',  // Madrid timezone
  target_score: 500,          // Points to complete challenge
  reward_points: 100          // Bonus for completion
};
```

## Feature Flags and Toggles

### Translation Features
```typescript
const TRANSLATION_CONFIG = {
  enabled: true,
  auto_detect_language: false,    // Future feature
  cache_translations: true,
  max_cache_size: 1000,          // Number of cached translations
  api_timeout: 5000,             // 5 seconds
  retry_attempts: 2,
  supported_languages: 20
};
```

### Food Analysis Features
```typescript
const FOOD_ANALYSIS_CONFIG = {
  ai_provider: 'google_gemini',
  fallback_enabled: true,
  cache_results: true,
  max_image_size: 10485760,      // 10MB
  supported_formats: ['jpg', 'jpeg', 'png', 'webp'],
  confidence_threshold: 0.7,
  batch_size: 1                  // Process one image at a time
};
```

### Gamification Features
```typescript
const GAMIFICATION_CONFIG = {
  points_enabled: true,
  levels_enabled: true,
  leaderboard_enabled: true,
  achievements_enabled: true,
  weekly_challenges_enabled: true,
  streak_tracking_enabled: true
};
```

## Security Configuration

### Session Management
```typescript
const SESSION_CONFIG = {
  secret: process.env.SESSION_SECRET,
  name: 'veridect.sid',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,              // HTTPS only in production
    maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
  }
};
```

### CORS Configuration
```typescript
const CORS_CONFIG = {
  origin: process.env.REPLIT_DOMAINS?.split(',') || ['localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

## Performance Configuration

### Database Connection Pool
```typescript
const DB_CONFIG = {
  connectionString: process.env.DATABASE_URL,
  max: 20,                    // Maximum connections
  idleTimeoutMillis: 30000,   // 30 seconds
  connectionTimeoutMillis: 2000 // 2 seconds
};
```

### Cache Configuration
```typescript
const CACHE_CONFIG = {
  // Translation cache
  translation_ttl: 86400000,    // 24 hours in milliseconds
  
  // Food analysis cache  
  analysis_ttl: 3600000,        // 1 hour in milliseconds
  
  // User session cache
  session_ttl: 604800000        // 1 week in milliseconds
};
```

## Development vs Production

### Development Configuration
```bash
NODE_ENV="development"
DEBUG="veridect:*"
LOG_LEVEL="debug"
```

### Production Configuration
```bash
NODE_ENV="production"
LOG_LEVEL="info"
TRUST_PROXY="1"
```

## Monitoring and Logging

### Logging Configuration
```typescript
const LOGGING_CONFIG = {
  level: process.env.LOG_LEVEL || 'info',
  format: 'json',
  timestamp: true,
  colorize: false,
  outputs: ['console']        // Add 'file' for production
};
```

### Health Check Configuration
```typescript
const HEALTH_CHECK = {
  endpoint: '/health',
  checks: [
    'database_connection',
    'external_api_status',
    'session_store_status'
  ],
  timeout: 5000              // 5 seconds
};
```

## Backup and Recovery

### Database Backup Configuration
```bash
# Daily backup schedule (configure in hosting platform)
BACKUP_SCHEDULE="0 2 * * *"    # 2 AM daily
BACKUP_RETENTION="30"          # Keep 30 days
BACKUP_LOCATION="s3://backups/veridect/"
```

### Data Retention Policies
```typescript
const RETENTION_POLICIES = {
  food_logs: '2 years',
  user_sessions: '30 days',
  translation_cache: '30 days',
  error_logs: '90 days',
  analytics_data: '1 year'
};
```

## API Rate Limits

### External API Limits
```typescript
const API_LIMITS = {
  google_gemini: {
    requests_per_minute: 60,
    requests_per_day: 1000
  },
  mymemory_translation: {
    requests_per_day: 1000,    // Free tier limit
    words_per_day: 10000       // Free tier limit
  },
  stripe: {
    requests_per_second: 25
  }
};
```

### Internal Rate Limits
```typescript
const INTERNAL_LIMITS = {
  food_analysis: {
    per_user_per_hour: 50,
    per_user_per_day: 200
  },
  translation_requests: {
    per_user_per_minute: 20,
    per_user_per_hour: 500
  }
};
```

## Deployment Configuration

### Build Configuration
```json
{
  "scripts": {
    "build": "vite build",
    "build:server": "esbuild server/index.ts --bundle --platform=node --outfile=dist/server.js",
    "start": "node dist/server.js",
    "dev": "NODE_ENV=development tsx server/index.ts"
  }
}
```

### Replit Configuration (.replit)
```toml
[deployment]
run = ["npm", "start"]
deploymentTarget = "cloudrun"

[[ports]]
localPort = 5000
externalPort = 80
```

---

**Configuration Version**: 1.0  
**Last Updated**: June 23, 2025  
**Next Review**: Monthly maintenance cycle