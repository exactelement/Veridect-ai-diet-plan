# Veridect - AI-Powered Food Analysis Platform
## Complete Technical Specification & Implementation Guide

### Project Overview
Veridect is a live revenue-generating AI-powered nutrition analysis platform that enables users to analyze food via photos, uploads, or text input. The platform provides simple "Yes," "No," or "OK" verdicts with detailed explanations in 20+ languages, targeting 100k users and 20k paying customers.

**Key Business Metrics:**
- Currently serving paying customers
- Pro tier: €1/month (billed yearly)
- Advanced tier: €50/month
- Strong LTV:CAC ratio with high gross margins
- Patent-pending AI technology

---

## 1. SYSTEM ARCHITECTURE

### 1.1 Technology Stack

**Frontend:**
- React 18 with TypeScript
- Vite (build tool)
- Wouter (routing)
- TanStack Query (server state)
- Shadcn/UI + Radix UI (components)
- Tailwind CSS (styling)
- React Hook Form + Zod (forms)

**Backend:**
- Node.js 20 with Express.js
- TypeScript
- PostgreSQL with Drizzle ORM
- Replit Auth (multi-provider authentication)
- Google Gemini 1.5 Flash (AI analysis)
- Stripe (payments)
- SendGrid (emails)

**Database:**
- PostgreSQL (Neon serverless)
- Drizzle ORM for type-safe operations
- Session-based authentication storage

**External Services:**
- Replit Auth (Google, Apple, email/password)
- Google Gemini AI API
- Stripe payment processing
- SendGrid email delivery
- Neon PostgreSQL hosting

### 1.2 Project Structure
```
├── client/src/                 # React frontend
│   ├── components/            # Reusable UI components
│   ├── pages/                # Page components
│   ├── lib/                  # Utilities and configs
│   └── hooks/                # Custom React hooks
├── server/                   # Express backend
│   ├── services/            # Business logic services
│   ├── middleware/          # Express middleware
│   └── routes.ts           # API endpoints
├── shared/                  # Shared types and schemas
│   └── schema.ts           # Database schema & validation
├── public/                  # Static assets
└── attached_assets/         # User uploaded assets
```

---

## 2. CORE FEATURES SPECIFICATION

### 2.1 User Authentication & Onboarding

**Authentication System:**
- Replit Auth integration (Google, Apple, email/password)
- Session-based authentication with PostgreSQL storage
- Multi-step onboarding flow
- GDPR compliance system

**Onboarding Flow:**
1. **Welcome Screen** - App introduction
2. **Suitability Quiz** - 5 questions to assess user fit
3. **Personalization Questions** - Health goals, diet preferences, allergies
4. **Pro Features Showcase** - Feature comparison and upgrade prompts
5. **Completion** - Dashboard access

**Implementation Details:**
```typescript
// Key onboarding endpoints
POST /api/user/onboarding
POST /api/user/complete-onboarding
POST /api/user/gdpr-consent

// Database schema (shared/schema.ts)
users: {
  hasCompletedOnboarding: boolean
  onboardingSuitabilityScore: number
  healthGoals: string[]
  dietaryPreferences: string[]
  allergies: string[]
  fitnessLevel: string
  gdprConsent: object
}
```

### 2.2 AI Food Analysis Engine

**Core Functionality:**
- Photo analysis via camera or upload
- Text-based food input
- Google Gemini 1.5 Flash integration
- Personalized analysis based on user profile
- Emoji verdicts: ✅ (YES), ⚠️ (OK), ❌ (NO)

**Analysis Features:**
- Editable results with inline editing
- "Why?" button for scientific justification
- Nutritional breakdown (calories, protein, carbs, etc.)
- Personalized recommendations
- Smart responses for non-food items

**API Implementation:**
```typescript
// Main analysis endpoint
POST /api/food/analyze
{
  foodName?: string,
  imageData?: string  // base64 encoded image
}

// Response format
{
  foodName: string,
  verdict: "YES" | "NO" | "OK",
  explanation: string,
  calories?: number,
  protein?: number,
  // ... other nutrients
  confidence: number,
  scientificJustification?: string
}
```

**Gemini Integration:**
- Located in `server/services/gemini.ts`
- Deterministic analysis for consistent results
- User profile-based personalization
- Fallback system for API failures
- Witty responses for non-food items

### 2.3 Diet Planning & AI Chat

**AI Nutrition Assistant:**
- Real-time chat interface with Gemini AI
- Personalized meal planning
- Weekly meal plan generation
- Shopping list organization by grocery aisle
- Context-aware conversations

**Features:**
- Chat history with timestamps
- Typing indicators
- Meal plan tabs (Breakfast, Lunch, Dinner, Snacks)
- Editable meal plans
- Quantity tracking for shopping lists
- Pro-tier feature gating

**Implementation:**
```typescript
// Diet planning endpoint
POST /api/diet/chat
{
  message: string,
  context?: string  // Previous conversation context
}

// Meal plan structure
interface MealPlan {
  day: string,
  meals: {
    breakfast: string[],
    lunch: string[],
    dinner: string[],
    snacks: string[]
  },
  completed: Record<string, boolean>
}
```

### 2.4 Gamification System

**Points & Levels:**
- Dual point system (lifetime + weekly)
- Daily analysis challenges
- Consecutive "YES" food streaks
- Milestone bonuses
- Leaderboard rankings

**Challenge System:**
- 5 analyses per day = 25 bonus points
- 10 analyses per day = 50 bonus points
- 3+ consecutive YES foods = streak bonuses
- Weekly resets every Monday (Madrid timezone)

**Implementation:**
```typescript
// Points tracking
POST /api/food/log  // Auto-awards points
GET /api/leaderboard/my-score
GET /api/leaderboard/weekly

// Bonus system
bonusLogs: {
  userId: string,
  bonusType: string,
  points: number,
  awardedAt: Date
}
```

### 2.5 Subscription Management

**Tier Structure:**
- **Free**: 5 analyses/day, basic features
- **Pro**: €1/month, unlimited analyses, full features
- **Advanced**: €50/month, medical features

**Stripe Integration:**
- Webhook handling for subscription events
- Automatic tier upgrades/downgrades
- Usage tracking and limits
- Admin override for specific emails

**Feature Gating:**
```typescript
// Subscription limits (server/services/subscriptionLimits.ts)
interface TierLimits {
  dailyAnalyses: number,
  dietPlanning: boolean,
  foodHistory: boolean,
  leaderboardAccess: boolean,
  // ... other features
}
```

---

## 3. DATABASE SCHEMA

### 3.1 Core Tables

**Users Table:**
```sql
CREATE TABLE users (
  id VARCHAR PRIMARY KEY,
  email VARCHAR UNIQUE,
  firstName VARCHAR,
  lastName VARCHAR,
  subscriptionTier VARCHAR DEFAULT 'free',
  hasCompletedOnboarding BOOLEAN DEFAULT false,
  onboardingSuitabilityScore INTEGER,
  healthGoals TEXT[],
  dietaryPreferences TEXT[],
  allergies TEXT[],
  fitnessLevel VARCHAR,
  gdprConsent JSONB,
  hasSeenGdprBanner BOOLEAN DEFAULT false,
  lifetimePoints INTEGER DEFAULT 0,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

**Food Logs Table:**
```sql
CREATE TABLE foodLogs (
  id SERIAL PRIMARY KEY,
  userId VARCHAR REFERENCES users(id),
  foodName VARCHAR NOT NULL,
  verdict VARCHAR NOT NULL,
  explanation TEXT,
  calories INTEGER,
  protein DECIMAL,
  carbohydrates DECIMAL,
  fat DECIMAL,
  method VARCHAR DEFAULT 'ai',
  confidence INTEGER,
  imageUrl VARCHAR,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

**Weekly Scores Table:**
```sql
CREATE TABLE weeklyScores (
  id SERIAL PRIMARY KEY,
  userId VARCHAR REFERENCES users(id),
  weekStartDate DATE NOT NULL,
  totalPoints INTEGER DEFAULT 0,
  analysisCount INTEGER DEFAULT 0,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

**Sessions Table:**
```sql
CREATE TABLE sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);
```

### 3.2 Drizzle Schema

Located in `shared/schema.ts`:
```typescript
export const users = pgTable('users', {
  id: varchar('id').primaryKey(),
  email: varchar('email').unique(),
  subscriptionTier: varchar('subscriptionTier').default('free'),
  hasCompletedOnboarding: boolean('hasCompletedOnboarding').default(false),
  // ... all user fields
});

export const foodLogs = pgTable('foodLogs', {
  id: serial('id').primaryKey(),
  userId: varchar('userId').references(() => users.id),
  foodName: varchar('foodName').notNull(),
  verdict: varchar('verdict').notNull(),
  // ... all food log fields
});
```

---

## 4. API ENDPOINTS SPECIFICATION

### 4.1 Authentication Endpoints
```typescript
GET  /api/auth/user              // Get current user
POST /api/auth/login             // Login user
POST /api/auth/logout            // Logout user
POST /api/user/profile           // Update user profile
POST /api/user/onboarding        // Save onboarding data
POST /api/user/complete-onboarding // Complete onboarding
POST /api/user/gdpr-consent      // Update GDPR consent
DELETE /api/user/account         // Delete user account
```

### 4.2 Food Analysis Endpoints
```typescript
POST /api/food/analyze           // Analyze food (photo/text)
POST /api/food/log               // Log analyzed food
GET  /api/food/logs              // Get user's food history
GET  /api/food/logs/today        // Get today's food logs
GET  /api/food/yes-streak        // Get consecutive YES streak
POST /api/food/update-log        // Update existing food log
DELETE /api/food/log/:id         // Delete food log
```

### 4.3 Diet Planning Endpoints
```typescript
POST /api/diet/chat              // AI nutrition assistant chat
```

### 4.4 Gamification Endpoints
```typescript
GET /api/leaderboard/my-score    // Get user's current score
GET /api/leaderboard/weekly      // Get weekly leaderboard
GET /api/challenges/daily        // Get daily challenge status
```

### 4.5 Subscription Endpoints
```typescript
GET  /api/subscription/status    // Get subscription status
POST /api/subscription/create    // Create Stripe checkout
POST /api/subscription/cancel    // Cancel subscription
POST /api/webhooks/stripe        // Stripe webhook handler
```

---

## 5. FRONTEND IMPLEMENTATION

### 5.1 Page Structure

**Main Pages:**
- `/` - Food analysis page (camera/upload/text input)
- `/home` - Dashboard with stats and food logs
- `/onboarding` - Multi-step onboarding flow
- `/diet-plan` - AI chat and meal planning
- `/profile` - User settings and preferences
- `/subscription` - Upgrade and billing management
- `/progress` - Detailed analytics and history

### 5.2 Component Architecture

**Core Components:**
```typescript
// Navigation (client/src/components/navigation.tsx)
- Bottom navigation bar
- Tier-based feature access
- Active route highlighting

// Authentication (client/src/components/auth/)
- Login/signup forms
- Social auth buttons
- Profile management

// Food Analysis (client/src/components/food/)
- Camera interface
- Image upload
- Text input form
- Results display with editing

// UI Components (client/src/components/ui/)
- Shadcn/UI components
- Custom iOS-inspired design system
- Reusable form elements
```

### 5.3 State Management

**TanStack Query Implementation:**
```typescript
// Query keys structure
const queryKeys = {
  user: ['user'] as const,
  foodLogs: ['foodLogs'] as const,
  todaysLogs: ['foodLogs', 'today'] as const,
  leaderboard: ['leaderboard'] as const,
  // ... other keys
};

// Custom hooks for data fetching
const useAuth = () => useQuery({
  queryKey: queryKeys.user,
  queryFn: () => fetch('/api/auth/user').then(res => res.json())
});
```

### 5.4 Styling System

**Tailwind Configuration:**
```typescript
// Custom colors (index.css)
:root {
  --ios-bg: hsl(0, 0%, 98%);
  --ios-text: hsl(0, 0%, 20%);
  --ios-blue: hsl(210, 100%, 50%);
  --health-green: hsl(120, 70%, 45%);
  --warning-orange: hsl(30, 90%, 55%);
  --danger-red: hsl(0, 70%, 55%);
}

// Component styling
.ios-shadow {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

---

## 6. BACKEND IMPLEMENTATION

### 6.1 Server Architecture

**Main Server File (server/index.ts):**
```typescript
// Core setup
import express from 'express';
import { setupAuth } from './multiAuth';
import { setupRoutes } from './routes';
import { DatabaseStorage } from './storage';

const app = express();
const storage = new DatabaseStorage();

// Middleware setup
app.use(express.json({ limit: '10mb' }));
app.use(helmet());
app.use(cors());

// Authentication setup
setupAuth(app, storage);
setupRoutes(app, storage);
```

### 6.2 Services Layer

**Food Analysis Service (server/services/foodAnalysis.ts):**
```typescript
export async function analyzeFoodWithGemini(
  foodName?: string,
  imageData?: string,
  userProfile?: UserProfile
): Promise<FoodAnalysisResult> {
  // Gemini API integration
  // Result caching and consistency
  // Fallback handling
}
```

**Subscription Limits (server/services/subscriptionLimits.ts):**
```typescript
export function checkSubscriptionLimits(
  tier: string,
  feature: keyof TierLimits,
  currentUsage: number,
  userEmail?: string
): LimitCheckResult {
  // Tier-based feature access
  // Usage tracking
  // Admin overrides
}
```

### 6.3 Database Layer

**Storage Interface (server/storage.ts):**
```typescript
export interface IStorage {
  // User management
  getUser(id: string): Promise<User | null>;
  updateUserProfile(id: string, data: any): Promise<User>;
  
  // Food logging
  saveFoodLog(data: FoodLogData): Promise<FoodLog>;
  getTodaysFoodLogs(userId: string): Promise<FoodLog[]>;
  
  // Gamification
  updateUserPoints(userId: string, points: number): Promise<void>;
  getWeeklyScore(userId: string): Promise<WeeklyScore>;
  
  // ... other methods
}
```

---

## 7. AI INTEGRATION

### 7.1 Gemini AI Configuration

**Setup (server/services/gemini.ts):**
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Prompt engineering for food analysis
const foodAnalysisPrompt = `
You are an expert nutritionist AI analyzing food for health recommendations.
Return a JSON response with the following structure:
{
  "foodName": "string",
  "verdict": "YES" | "NO" | "OK",
  "explanation": "string",
  "calories": number,
  "protein": number,
  // ... other nutrients
}
`;
```

### 7.2 Analysis Logic

**Personalization Factors:**
- User health goals (weight loss, muscle gain, etc.)
- Dietary preferences (vegan, keto, etc.)
- Allergies and restrictions
- Fitness level
- Subscription tier (affects detail level)

**Consistency Mechanisms:**
- Deterministic hashing for same inputs
- Result caching by user profile
- Standardized calorie ranges
- Food name normalization

---

## 8. DEPLOYMENT & INFRASTRUCTURE

### 8.1 Environment Variables

**Required Environment Variables:**
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# Authentication
REPLIT_AUTH_SECRET=your_secret_here

# AI Services
GOOGLE_GEMINI_API_KEY=your_gemini_key

# Payments
STRIPE_SECRET_KEY=sk_live_or_test_key
STRIPE_WEBHOOK_SECRET=whsec_webhook_secret

# Email
SENDGRID_API_KEY=your_sendgrid_key

# App Configuration
NODE_ENV=production
PORT=5000
```

### 8.2 Replit Deployment

**Configuration Files:**
```toml
# .replit
run = "npm run dev"
modules = ["nodejs-20"]

[nix]
channel = "stable-24_05"

[deployment]
run = ["sh", "-c", "npm run build && npm start"]
```

**Package Scripts:**
```json
{
  "scripts": {
    "dev": "tsx server/index.ts",
    "build": "vite build",
    "start": "node dist/server/index.js",
    "db:push": "drizzle-kit push",
    "db:migrate": "drizzle-kit migrate"
  }
}
```

---

## 9. SECURITY & COMPLIANCE

### 9.1 Security Measures

**Authentication Security:**
- Session-based authentication with secure cookies
- CSRF protection
- Rate limiting on sensitive endpoints
- Input validation with Zod schemas

**Data Protection:**
- SQL injection prevention via Drizzle ORM
- XSS protection with helmet middleware
- Secure password hashing with bcrypt
- Environment variable protection

### 9.2 GDPR Compliance

**Data Collection:**
- Explicit consent banners
- Granular privacy settings
- Data export capabilities
- Account deletion functionality

**Privacy Features:**
```typescript
// GDPR consent structure
interface GdprConsent {
  analytics: boolean;
  marketing: boolean;
  functionalCookies: boolean;
  consentDate: Date;
  ipAddress?: string;
}
```

---

## 10. TESTING & QUALITY ASSURANCE

### 10.1 Testing Strategy

**Frontend Testing:**
- Component unit tests with React Testing Library
- Integration tests for user flows
- E2E tests with Playwright
- Visual regression testing

**Backend Testing:**
- API endpoint testing with Jest
- Database integration tests
- Stripe webhook testing
- AI service mocking

### 10.2 Performance Optimization

**Frontend Optimization:**
- Code splitting with React.lazy
- Image optimization and lazy loading
- TanStack Query caching
- Bundle size monitoring

**Backend Optimization:**
- Database query optimization
- Redis caching for frequent queries
- API rate limiting
- CDN for static assets

---

## 11. MONITORING & ANALYTICS

### 11.1 Error Tracking

**Implementation:**
- Comprehensive error logging
- User action tracking
- API performance monitoring
- Database query analysis

### 11.2 Business Metrics

**Key Metrics to Track:**
- User acquisition and retention
- Subscription conversion rates
- Daily/weekly active users
- Feature usage analytics
- Revenue metrics

---

## 12. DEVELOPMENT WORKFLOW

### 12.1 Code Organization

**File Naming Conventions:**
- Use kebab-case for files and folders
- Component files: `ComponentName.tsx`
- Page files: `page-name.tsx`
- Service files: `serviceName.ts`

**Import Organization:**
```typescript
// External libraries
import React from 'react';
import { useQuery } from '@tanstack/react-query';

// Internal components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Local imports
import { useAuth } from '../hooks/useAuth';
import './component.css';
```

### 12.2 Development Commands

**Essential Commands:**
```bash
# Start development server
npm run dev

# Database operations
npm run db:push          # Push schema changes
npm run db:migrate       # Run migrations

# Build and deployment
npm run build           # Build for production
npm start              # Start production server

# Code quality
npm run lint           # Run ESLint
npm run type-check     # TypeScript checking
```

---

## 13. FEATURES IMPLEMENTATION CHECKLIST

### 13.1 Core Features ✅
- [x] User authentication with Replit Auth
- [x] Multi-step onboarding flow
- [x] AI food analysis with Gemini
- [x] Photo and text input analysis
- [x] Editable analysis results
- [x] Subscription management with Stripe
- [x] Gamification with points and challenges
- [x] Food logging and history
- [x] GDPR compliance system

### 13.2 Advanced Features ✅
- [x] AI diet planning and chat
- [x] Weekly meal plan generation
- [x] Shopping list organization
- [x] Leaderboard system
- [x] Progress tracking and analytics
- [x] Multi-language support preparation
- [x] Admin user overrides

### 13.3 Technical Features ✅
- [x] TypeScript throughout
- [x] Database schema with Drizzle ORM
- [x] API rate limiting and validation
- [x] Error handling and logging
- [x] Responsive design system
- [x] Performance optimization
- [x] Security best practices

---

## 14. DEPLOYMENT INSTRUCTIONS

### 14.1 Initial Setup

1. **Clone and Install:**
```bash
git clone <repository-url>
cd veridect
npm install
```

2. **Environment Configuration:**
```bash
cp .env.example .env
# Fill in all required environment variables
```

3. **Database Setup:**
```bash
npm run db:push
# Verify tables are created in your PostgreSQL database
```

4. **External Service Setup:**
- Configure Replit Auth
- Set up Google Gemini API access
- Configure Stripe webhooks
- Set up SendGrid email templates

### 14.2 Production Deployment

1. **Build Application:**
```bash
npm run build
```

2. **Deploy to Replit:**
- Push code to Replit repository
- Configure environment variables in Replit Secrets
- Enable Always On for 24/7 availability
- Set up custom domain if needed

3. **Post-Deployment Verification:**
- Test authentication flows
- Verify AI analysis functionality
- Test subscription payments
- Confirm email delivery
- Check database connections

---

## 15. MAINTENANCE & SCALING

### 15.1 Regular Maintenance

**Weekly Tasks:**
- Monitor error logs and fix issues
- Review user feedback and bug reports
- Update dependencies for security
- Check database performance

**Monthly Tasks:**
- Analyze user metrics and conversion rates
- Review and optimize AI prompts
- Update subscription pricing if needed
- Plan new feature development

### 15.2 Scaling Considerations

**Performance Scaling:**
- Implement Redis for caching
- Add database read replicas
- Use CDN for static assets
- Optimize database queries

**Feature Scaling:**
- Add more AI models (OpenAI, Claude)
- Implement advanced analytics
- Add social features
- Expand language support

---

This specification provides complete implementation details for building Veridect. Every component, API endpoint, database table, and feature has been documented with code examples and implementation guidance.