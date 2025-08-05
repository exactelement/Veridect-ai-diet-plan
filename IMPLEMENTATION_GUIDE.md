# Veridect Implementation Guide
## Step-by-Step Development Instructions

This guide provides detailed implementation steps for building Veridect from scratch.

---

## PHASE 1: PROJECT SETUP & FOUNDATION

### Step 1: Initialize Project Structure
```bash
# Create project directory
mkdir veridect-app
cd veridect-app

# Initialize Node.js project
npm init -y

# Install core dependencies
npm install express typescript tsx
npm install react react-dom vite @vitejs/plugin-react
npm install @types/node @types/express @types/react @types/react-dom

# Install UI and styling
npm install tailwindcss postcss autoprefixer
npm install @radix-ui/react-slot @radix-ui/react-dialog
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react

# Install data and state management
npm install @tanstack/react-query
npm install react-hook-form @hookform/resolvers
npm install zod drizzle-orm drizzle-kit
npm install @neondatabase/serverless

# Install authentication and payments
npm install passport passport-local passport-google-oauth20
npm install express-session connect-pg-simple
npm install stripe @stripe/stripe-js @stripe/react-stripe-js

# Install AI and external services
npm install @google/generative-ai
npm install @sendgrid/mail
```

### Step 2: Create Project Structure
```bash
mkdir -p {client/src/{components/{ui,auth,food},pages,lib,hooks},server/{services,middleware},shared,public,attached_assets}

# Create essential files
touch {client/src/App.tsx,client/src/main.tsx,client/src/index.css}
touch {server/index.ts,server/routes.ts,server/storage.ts}
touch {shared/schema.ts,shared/types.ts}
touch {vite.config.ts,tsconfig.json,tailwind.config.ts,postcss.config.js}
touch {package.json,.env.example,.gitignore}
```

### Step 3: Configure Build Tools

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
      '@assets': path.resolve(__dirname, './attached_assets'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});
```

**tailwind.config.ts:**
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './client/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'ios-bg': 'hsl(0, 0%, 98%)',
        'ios-text': 'hsl(0, 0%, 20%)',
        'ios-secondary': 'hsl(0, 0%, 45%)',
        'ios-blue': 'hsl(210, 100%, 50%)',
        'health-green': 'hsl(120, 70%, 45%)',
        'warning-orange': 'hsl(30, 90%, 55%)',
        'danger-red': 'hsl(0, 70%, 55%)',
      },
    },
  },
  plugins: [],
};

export default config;
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"],
      "@assets/*": ["./attached_assets/*"]
    }
  },
  "include": ["client/src", "shared", "server"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## PHASE 2: DATABASE SCHEMA & BACKEND FOUNDATION

### Step 4: Define Database Schema

**shared/schema.ts:**
```typescript
import { pgTable, varchar, serial, boolean, integer, decimal, text, timestamp, jsonb, date } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Users table
export const users = pgTable('users', {
  id: varchar('id').primaryKey(),
  email: varchar('email').unique(),
  firstName: varchar('firstName'),
  lastName: varchar('lastName'),
  profileImageUrl: varchar('profileImageUrl'),
  subscriptionTier: varchar('subscriptionTier').default('free'),
  authProvider: varchar('authProvider'),
  passwordHash: varchar('passwordHash'),
  
  // Onboarding
  hasCompletedOnboarding: boolean('hasCompletedOnboarding').default(false),
  onboardingSuitabilityScore: integer('onboardingSuitabilityScore'),
  
  // User preferences
  healthGoals: text('healthGoals').array(),
  dietaryPreferences: text('dietaryPreferences').array(),
  allergies: text('allergies').array(),
  fitnessLevel: varchar('fitnessLevel'),
  
  // GDPR and privacy
  gdprConsent: jsonb('gdprConsent'),
  hasSeenGdprBanner: boolean('hasSeenGdprBanner').default(false),
  privacySettings: jsonb('privacySettings'),
  
  // Gamification
  lifetimePoints: integer('lifetimePoints').default(0),
  currentLevel: integer('currentLevel').default(1),
  
  // Subscription
  stripeCustomerId: varchar('stripeCustomerId'),
  subscriptionStatus: varchar('subscriptionStatus'),
  subscriptionEndDate: timestamp('subscriptionEndDate'),
  
  // Timestamps
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

// Food logs table
export const foodLogs = pgTable('foodLogs', {
  id: serial('id').primaryKey(),
  userId: varchar('userId').references(() => users.id).notNull(),
  
  // Food details
  foodName: varchar('foodName').notNull(),
  verdict: varchar('verdict').notNull(), // YES, NO, OK
  explanation: text('explanation'),
  scientificJustification: text('scientificJustification'),
  
  // Nutritional data
  calories: integer('calories'),
  protein: decimal('protein'),
  carbohydrates: decimal('carbohydrates'),
  fat: decimal('fat'),
  fiber: decimal('fiber'),
  sugar: decimal('sugar'),
  sodium: decimal('sodium'),
  
  // Analysis metadata
  method: varchar('method').default('ai'), // ai, manual, fallback
  confidence: integer('confidence'),
  imageUrl: varchar('imageUrl'),
  analysisSource: varchar('analysisSource'),
  
  // Points awarded
  pointsAwarded: integer('pointsAwarded').default(0),
  
  createdAt: timestamp('createdAt').defaultNow(),
});

// Weekly scores table
export const weeklyScores = pgTable('weeklyScores', {
  id: serial('id').primaryKey(),
  userId: varchar('userId').references(() => users.id).notNull(),
  weekStartDate: date('weekStartDate').notNull(),
  
  // Score tracking
  totalPoints: integer('totalPoints').default(0),
  analysisCount: integer('analysisCount').default(0),
  yesVerdictCount: integer('yesVerdictCount').default(0),
  bonusPoints: integer('bonusPoints').default(0),
  
  // Leaderboard position
  weeklyRank: integer('weeklyRank'),
  
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

// Bonus tracking table
export const bonusLogs = pgTable('bonusLogs', {
  id: serial('id').primaryKey(),
  userId: varchar('userId').references(() => users.id).notNull(),
  bonusType: varchar('bonusType').notNull(), // 5_analyses, 3_yes_streak, etc.
  points: integer('points').notNull(),
  description: text('description'),
  awardedAt: timestamp('awardedAt').defaultNow(),
});

// Sessions table for authentication
export const sessions = pgTable('sessions', {
  sid: varchar('sid').primaryKey(),
  sess: jsonb('sess').notNull(),
  expire: timestamp('expire').notNull(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const insertFoodLogSchema = createInsertSchema(foodLogs);
export const updateUserProfileSchema = insertUserSchema.partial().omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type FoodLog = typeof foodLogs.$inferSelect;
export type NewFoodLog = typeof foodLogs.$inferInsert;
export type WeeklyScore = typeof weeklyScores.$inferSelect;
```

### Step 5: Create Database Storage Layer

**server/storage.ts:**
```typescript
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq, desc, and, gte, sql } from 'drizzle-orm';
import { users, foodLogs, weeklyScores, bonusLogs, sessions } from '@shared/schema';
import type { User, FoodLog, WeeklyScore } from '@shared/schema';

const connection = neon(process.env.DATABASE_URL!);
const db = drizzle(connection);

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(userData: any): Promise<User>;
  updateUserProfile(id: string, data: any): Promise<User>;
  deleteUserAccount(id: string): Promise<void>;
  completeOnboarding(id: string): Promise<User>;
  
  // Food logging
  saveFoodLog(logData: any): Promise<FoodLog>;
  getFoodLogs(userId: string, limit?: number): Promise<FoodLog[]>;
  getTodaysFoodLogs(userId: string): Promise<FoodLog[]>;
  updateFoodLog(id: number, data: any): Promise<FoodLog>;
  deleteFoodLog(id: number): Promise<void>;
  
  // Gamification
  updateUserPoints(userId: string, points: number): Promise<void>;
  getWeeklyScore(userId: string): Promise<WeeklyScore | null>;
  updateWeeklyScore(userId: string, points: number): Promise<void>;
  getLeaderboard(limit?: number): Promise<any[]>;
  
  // Bonus system
  wasBonusAwardedToday(userId: string, bonusType: string): Promise<boolean>;
  markBonusAwarded(userId: string, bonusType: string): Promise<void>;
  addBonusToWeeklyScore(userId: string, points: number): Promise<void>;
  
  // GDPR
  updateGdprConsent(userId: string, consent: any): Promise<User>;
  markGdprBannerSeen(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0] || null;
  }

  async createUser(userData: any): Promise<User> {
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }

  async updateUserProfile(id: string, data: any): Promise<User> {
    const result = await db.update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async saveFoodLog(logData: any): Promise<FoodLog> {
    const result = await db.insert(foodLogs).values(logData).returning();
    return result[0];
  }

  async getTodaysFoodLogs(userId: string): Promise<FoodLog[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return db.select().from(foodLogs)
      .where(and(
        eq(foodLogs.userId, userId),
        gte(foodLogs.createdAt, today)
      ))
      .orderBy(desc(foodLogs.createdAt));
  }

  async updateUserPoints(userId: string, points: number): Promise<void> {
    await db.update(users)
      .set({ 
        lifetimePoints: sql`${users.lifetimePoints} + ${points}`,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async getWeeklyScore(userId: string): Promise<WeeklyScore | null> {
    const weekStart = this.getWeekStart();
    const result = await db.select().from(weeklyScores)
      .where(and(
        eq(weeklyScores.userId, userId),
        eq(weeklyScores.weekStartDate, weekStart)
      ))
      .limit(1);
    return result[0] || null;
  }

  private getWeekStart(): string {
    const now = new Date();
    const madrid = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Madrid" }));
    const dayOfWeek = madrid.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    const weekStart = new Date(madrid);
    weekStart.setDate(madrid.getDate() - daysToSubtract);
    weekStart.setHours(0, 0, 0, 0);
    
    return weekStart.toISOString().split('T')[0];
  }

  // ... implement remaining methods
}

export const storage = new DatabaseStorage();
```

### Step 6: Create Drizzle Configuration

**drizzle.config.ts:**
```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './shared/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

---

## PHASE 3: AUTHENTICATION SYSTEM

### Step 7: Implement Authentication

**server/multiAuth.ts:**
```typescript
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';
import ConnectPgSimple from 'connect-pg-simple';
import bcrypt from 'bcryptjs';
import { storage } from './storage';

const PgSession = ConnectPgSimple(session);

export function setupMultiAuth(app: any, storage: any) {
  // Session configuration
  app.use(session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      tableName: 'sessions',
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Local strategy
  passport.use(new LocalStrategy({
    usernameField: 'email',
  }, async (email, password, done) => {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return done(null, false, { message: 'Invalid credentials' });
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return done(null, false, { message: 'Invalid credentials' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  // Google strategy
  if (process.env.GOOGLE_CLIENT_ID) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email from Google'));
        }

        let user = await storage.getUserByEmail(email);
        if (!user) {
          user = await storage.createUser({
            id: `google_${profile.id}`,
            email,
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
            profileImageUrl: profile.photos?.[0]?.value,
            authProvider: 'google',
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }));
  }

  // Serialization
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}

export function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}
```

---

## PHASE 4: AI FOOD ANALYSIS

### Step 8: Implement Gemini Integration

**server/services/gemini.ts:**
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

export interface GeminiAnalysisResult {
  foodName: string;
  verdict: "YES" | "NO" | "OK";
  explanation: string;
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  confidence: number;
  scientificJustification?: string;
}

export async function analyzeWithGemini(
  foodName?: string,
  imageData?: string,
  userProfile?: any
): Promise<GeminiAnalysisResult> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  let personalizedContext = "";
  if (userProfile) {
    personalizedContext = `
PERSONALIZED ANALYSIS FOR THIS USER:
- Health Goals: ${userProfile.healthGoals?.join(', ') || 'Not specified'}
- Dietary Preferences: ${userProfile.dietaryPreferences?.join(', ') || 'Not specified'}
- Allergies: ${userProfile.allergies?.join(', ') || 'None specified'}
- Fitness Level: ${userProfile.fitnessLevel || 'Not specified'}

Analyze this food specifically for THIS USER's goals and restrictions.`;
  }

  const prompt = `
You are an expert nutritionist AI. Analyze the ${imageData ? 'food in this image' : `food: "${foodName}"`}.

${personalizedContext}

Provide analysis in this EXACT JSON format:
{
  "foodName": "specific food name",
  "verdict": "YES" | "NO" | "OK",
  "explanation": "brief explanation (2-3 sentences)",
  "calories": estimated_calories_per_serving,
  "protein": protein_in_grams,
  "carbohydrates": carbs_in_grams,
  "fat": fat_in_grams,
  "confidence": confidence_score_0_to_100,
  "scientificJustification": "detailed nutritional science explanation"
}

Verdict Guidelines:
- YES: Highly nutritious, supports health goals
- OK: Moderate nutrition, acceptable in moderation
- NO: Low nutrition value, should be avoided

Return ONLY the JSON, no other text.`;

  try {
    const parts = [];
    if (imageData) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imageData.split(',')[1]
        }
      });
    }
    parts.push({ text: prompt });

    const result = await model.generateContent(parts);
    const response = result.response.text();
    
    // Parse JSON response
    const cleanResponse = response.replace(/```json\n?|```\n?/g, '').trim();
    const analysis = JSON.parse(cleanResponse);
    
    // Validate required fields
    if (!analysis.verdict || !['YES', 'NO', 'OK'].includes(analysis.verdict)) {
      throw new Error('Invalid verdict in AI response');
    }

    return analysis;
  } catch (error) {
    console.error('Gemini analysis error:', error);
    
    // Fallback response
    return {
      foodName: foodName || 'Unknown Food',
      verdict: 'OK',
      explanation: 'Unable to analyze this food completely. Please try again.',
      confidence: 50,
      scientificJustification: 'Analysis unavailable due to processing error.'
    };
  }
}
```

### Step 9: Create Food Analysis Service

**server/services/foodAnalysis.ts:**
```typescript
import { analyzeWithGemini, type GeminiAnalysisResult } from "./gemini";

export interface FoodAnalysisResult extends GeminiAnalysisResult {
  method: "ai" | "fallback";
}

// Smart cache for consistent results
const analysisCache = new Map<string, FoodAnalysisResult>();

export function clearAnalysisCache(): void {
  analysisCache.clear();
}

// Normalize food names for consistent caching
function normalizeFoodName(foodName: string): string {
  return foodName.toLowerCase().trim()
    .replace(/\b(a|an|the|some|1|one)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function analyzeFoodWithGemini(
  foodName?: string,
  imageData?: string,
  userProfile?: any
): Promise<FoodAnalysisResult> {
  try {
    // Create cache key
    const cacheKey = [
      normalizeFoodName(foodName || 'image'),
      userProfile?.healthGoals?.sort().join(',') || '',
      userProfile?.dietaryPreferences?.sort().join(',') || '',
      userProfile?.allergies?.sort().join(',') || ''
    ].join('|');

    // Check cache first
    if (analysisCache.has(cacheKey)) {
      return analysisCache.get(cacheKey)!;
    }

    // Get AI analysis
    const analysis = await analyzeWithGemini(foodName, imageData, userProfile);
    
    const result: FoodAnalysisResult = {
      ...analysis,
      method: "ai"
    };

    // Cache result
    analysisCache.set(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error('Food analysis error:', error);
    
    // Return fallback
    return {
      foodName: foodName || 'Unknown Food',
      verdict: 'OK',
      explanation: 'Unable to analyze this food. Please try again.',
      confidence: 50,
      method: "fallback"
    };
  }
}
```

---

## PHASE 5: API ROUTES IMPLEMENTATION

### Step 10: Create Main API Routes

**server/routes.ts:**
```typescript
import type { Express } from "express";
import { storage } from "./storage";
import { isAuthenticated } from "./multiAuth";
import { analyzeFoodWithGemini } from "./services/foodAnalysis";
import { checkSubscriptionLimits } from "./services/subscriptionLimits";
import { GoogleGenerativeAI } from "@google/generative-ai";

export function setupRoutes(app: Express) {
  // Authentication routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    res.json(req.user);
  });

  app.post('/api/auth/login', passport.authenticate('local'), (req: any, res) => {
    res.json(req.user);
  });

  app.post('/api/auth/logout', (req: any, res) => {
    req.logout(() => {
      res.json({ message: 'Logged out successfully' });
    });
  });

  // User profile routes
  app.put('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const updatedUser = await storage.updateUserProfile(userId, req.body);
      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update profile' });
    }
  });

  // Food analysis routes
  app.post('/api/food/analyze', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { foodName, imageData } = req.body;

      if (!foodName && !imageData) {
        return res.status(400).json({ message: 'Food name or image required' });
      }

      // Check subscription limits
      const user = await storage.getUser(userId);
      const todaysAnalyses = await storage.getTodaysFoodLogs(userId);
      const limitCheck = checkSubscriptionLimits(
        user?.subscriptionTier || 'free',
        'dailyAnalyses',
        todaysAnalyses.length,
        user?.email
      );

      if (!limitCheck.allowed) {
        return res.status(403).json({
          message: limitCheck.message,
          upgradeRequired: true
        });
      }

      // Get analysis
      const analysis = await analyzeFoodWithGemini(
        foodName,
        imageData,
        {
          healthGoals: user?.healthGoals || [],
          dietaryPreferences: user?.dietaryPreferences || [],
          allergies: user?.allergies || [],
          subscriptionTier: user?.subscriptionTier || 'free'
        }
      );

      res.json(analysis);
    } catch (error) {
      console.error('Analysis error:', error);
      res.status(500).json({ message: 'Analysis failed' });
    }
  });

  // Food logging routes
  app.post('/api/food/log', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const logData = { ...req.body, userId };

      // Save food log
      const foodLog = await storage.saveFoodLog(logData);

      // Award points based on verdict
      let points = 0;
      switch (foodLog.verdict) {
        case 'YES': points = 10; break;
        case 'OK': points = 5; break;
        case 'NO': points = 2; break;
      }

      await storage.updateUserPoints(userId, points);
      await storage.updateWeeklyScore(userId, points);

      res.json(foodLog);
    } catch (error) {
      res.status(500).json({ message: 'Failed to log food' });
    }
  });

  app.get('/api/food/logs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const logs = await storage.getFoodLogs(userId, 50);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get food logs' });
    }
  });

  app.get('/api/food/logs/today', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const logs = await storage.getTodaysFoodLogs(userId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get today\'s logs' });
    }
  });

  // Diet planning AI chat
  app.post('/api/diet/chat', isAuthenticated, async (req: any, res) => {
    try {
      const { message, context } = req.body;
      const userId = req.user.id;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const user = await storage.getUser(userId);
      
      // Check Pro access
      if (user?.subscriptionTier === 'free') {
        return res.status(403).json({
          error: 'Diet planning requires Pro subscription',
          upgradeRequired: true
        });
      }

      // Use Gemini for diet planning
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
You are an expert AI nutrition assistant.

USER PROFILE:
- Health Goals: ${user?.healthGoals?.join(', ') || 'General health'}
- Dietary Preferences: ${user?.dietaryPreferences?.join(', ') || 'None'}
- Allergies: ${user?.allergies?.join(', ') || 'None'}

CONVERSATION CONTEXT: ${context || 'New conversation'}
USER MESSAGE: ${message}

Provide helpful, personalized nutrition advice. Keep responses conversational and under 3 paragraphs.`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      res.json({
        response,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Diet planning error:', error);
      res.status(500).json({ error: 'Failed to generate diet advice' });
    }
  });

  // Gamification routes
  app.get('/api/leaderboard/my-score', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const weeklyScore = await storage.getWeeklyScore(userId);
      const user = await storage.getUser(userId);
      
      res.json({
        weeklyPoints: weeklyScore?.totalPoints || 0,
        lifetimePoints: user?.lifetimePoints || 0,
        currentLevel: user?.currentLevel || 1,
        weeklyRank: weeklyScore?.weeklyRank || null
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get score' });
    }
  });

  app.get('/api/leaderboard/weekly', isAuthenticated, async (req: any, res) => {
    try {
      const leaderboard = await storage.getLeaderboard(20);
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get leaderboard' });
    }
  });
}
```

---

## PHASE 6: FRONTEND IMPLEMENTATION

### Step 11: Create Main App Structure

**client/src/App.tsx:**
```typescript
import React from 'react';
import { Route, Switch } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/useAuth';

// Pages
import HomePage from '@/pages/home';
import FoodAnalysisPage from '@/pages/food-analysis';
import OnboardingPage from '@/pages/onboarding';
import DietPlanPage from '@/pages/diet-plan';
import ProfilePage from '@/pages/profile';
import SubscriptionPage from '@/pages/subscription';

// Components
import Navigation from '@/components/navigation';
import GdprConsentBanner from '@/components/gdpr-consent-banner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-ios-bg">
          <Switch>
            <Route path="/onboarding" component={OnboardingPage} />
            <Route path="/home" component={HomePage} />
            <Route path="/diet-plan" component={DietPlanPage} />
            <Route path="/profile" component={ProfilePage} />
            <Route path="/subscription" component={SubscriptionPage} />
            <Route path="/" component={FoodAnalysisPage} />
          </Switch>
          
          <Navigation />
          <GdprConsentBanner />
          <Toaster />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

### Step 12: Create Authentication Hook

**client/src/hooks/useAuth.tsx:**
```typescript
import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  subscriptionTier?: string;
  hasCompletedOnboarding?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const response = await fetch('/api/auth/user');
      if (!response.ok) {
        if (response.status === 401) return null;
        throw new Error('Failed to fetch user');
      }
      return response.json();
    },
    retry: false,
  });

  const login = async (credentials: any) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const user = await response.json();
    queryClient.setQueryData(['auth', 'user'], user);
    
    if (!user.hasCompletedOnboarding) {
      navigate('/onboarding');
    } else {
      navigate('/home');
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    queryClient.setQueryData(['auth', 'user'], null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Step 13: Create Food Analysis Page

**client/src/pages/food-analysis.tsx:**
```typescript
import React, { useState, useRef } from 'react';
import { Camera, Upload, Type, Edit, Save, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';

interface AnalysisResult {
  foodName: string;
  verdict: 'YES' | 'NO' | 'OK';
  explanation: string;
  calories?: number;
  protein?: number;
  scientificJustification?: string;
}

export default function FoodAnalysisPage() {
  const [analysisMethod, setAnalysisMethod] = useState<'camera' | 'upload' | 'text'>('camera');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedResult, setEditedResult] = useState<AnalysisResult | null>(null);
  const [showScientific, setShowScientific] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const analyzeMutation = useMutation({
    mutationFn: async (data: { foodName?: string; imageData?: string }) => {
      const response = await fetch('/api/food/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Analysis failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      setEditedResult(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getVerdictEmoji = (verdict: string) => {
    switch (verdict) {
      case 'YES': return '✅';
      case 'NO': return '❌';
      case 'OK': return '⚠️';
      default: return '❓';
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'YES': return 'bg-health-green';
      case 'NO': return 'bg-danger-red';
      case 'OK': return 'bg-warning-orange';
      default: return 'bg-gray-500';
    }
  };

  const handleAnalyze = () => {
    if (analysisMethod === 'text' && textInput.trim()) {
      analyzeMutation.mutate({ foodName: textInput.trim() });
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d')!;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    analyzeMutation.mutate({ imageData });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      analyzeMutation.mutate({ imageData });
    };
    reader.readAsDataURL(file);
  };

  const saveEdits = () => {
    if (editedResult) {
      setAnalysisResult(editedResult);
      setIsEditing(false);
    }
  };

  const currentResult = editedResult || analysisResult;

  return (
    <div className="min-h-screen bg-ios-bg pt-20 pb-32">
      <div className="px-4">
        <div className="max-w-4xl mx-auto">
          {!analysisResult ? (
            // Analysis Input Section
            <Card className="ios-shadow border-0">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-ios-text">
                  Analyze Your Food
                </CardTitle>
                <p className="text-ios-secondary">
                  Get instant health insights with AI-powered analysis
                </p>
              </CardHeader>
              <CardContent>
                {/* Method Selection */}
                <div className="flex gap-2 mb-6">
                  <Button
                    variant={analysisMethod === 'camera' ? 'default' : 'outline'}
                    onClick={() => setAnalysisMethod('camera')}
                    className="flex-1"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Camera
                  </Button>
                  <Button
                    variant={analysisMethod === 'upload' ? 'default' : 'outline'}
                    onClick={() => setAnalysisMethod('upload')}
                    className="flex-1"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                  <Button
                    variant={analysisMethod === 'text' ? 'default' : 'outline'}
                    onClick={() => setAnalysisMethod('text')}
                    className="flex-1"
                  >
                    <Type className="w-4 h-4 mr-2" />
                    Text
                  </Button>
                </div>

                {/* Input Method Implementation */}
                {analysisMethod === 'text' && (
                  <div className="space-y-4">
                    <Input
                      placeholder="Enter food name (e.g., 'grilled chicken salad')"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      className="text-lg p-4"
                    />
                    <Button
                      onClick={handleAnalyze}
                      disabled={!textInput.trim() || analyzeMutation.isPending}
                      className="w-full bg-ios-blue hover:bg-blue-600 text-white"
                    >
                      {analyzeMutation.isPending ? 'Analyzing...' : 'Analyze Food'}
                    </Button>
                  </div>
                )}

                {analysisMethod === 'upload' && (
                  <div className="text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={analyzeMutation.isPending}
                      className="bg-ios-blue hover:bg-blue-600 text-white"
                    >
                      {analyzeMutation.isPending ? 'Analyzing...' : 'Choose Photo'}
                    </Button>
                  </div>
                )}

                {analysisMethod === 'camera' && (
                  <div className="text-center space-y-4">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full max-w-md mx-auto rounded-lg"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    <Button
                      onClick={capturePhoto}
                      disabled={analyzeMutation.isPending}
                      className="bg-ios-blue hover:bg-blue-600 text-white"
                    >
                      {analyzeMutation.isPending ? 'Analyzing...' : 'Capture & Analyze'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            // Results Section
            <div className="space-y-6">
              <Card className="ios-shadow border-0">
                <CardContent className="p-8 text-center">
                  <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${getVerdictColor(currentResult.verdict)}/10`}>
                    <span className="text-4xl">
                      {getVerdictEmoji(currentResult.verdict)}
                    </span>
                  </div>
                  
                  {isEditing ? (
                    <Input
                      value={editedResult?.foodName || currentResult.foodName}
                      onChange={(e) => setEditedResult({
                        ...currentResult,
                        foodName: e.target.value
                      })}
                      className="text-2xl font-bold text-center mb-4"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-ios-text mb-2">
                      {currentResult.foodName}
                    </h2>
                  )}

                  <Badge className={`${getVerdictColor(currentResult.verdict)} text-white text-lg px-4 py-1 mb-4`}>
                    {currentResult.verdict}
                  </Badge>

                  {isEditing ? (
                    <textarea
                      value={editedResult?.explanation || currentResult.explanation}
                      onChange={(e) => setEditedResult({
                        ...currentResult,
                        explanation: e.target.value
                      })}
                      className="w-full p-3 border rounded-lg text-ios-secondary"
                      rows={3}
                    />
                  ) : (
                    <p className="text-ios-secondary mb-6">
                      {currentResult.explanation}
                    </p>
                  )}

                  <div className="flex justify-center gap-2 mb-6">
                    {isEditing ? (
                      <Button onClick={saveEdits} className="bg-health-green hover:bg-green-600 text-white">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => {
                          setIsEditing(true);
                          setEditedResult(currentResult);
                        }}
                        variant="outline"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Result
                      </Button>
                    )}
                    
                    <Button 
                      onClick={() => setShowScientific(!showScientific)}
                      variant="outline"
                    >
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Why?
                    </Button>
                  </div>

                  {/* Scientific Justification */}
                  {showScientific && currentResult.scientificJustification && (
                    <Card className="mt-4 text-left">
                      <CardHeader>
                        <CardTitle className="text-lg">Scientific Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-ios-secondary">
                          {currentResult.scientificJustification}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Nutrition Info */}
                  {(currentResult.calories || currentResult.protein) && (
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      {currentResult.calories && (
                        <div className="text-center p-3 bg-ios-bg rounded-lg">
                          <div className="text-2xl font-bold text-ios-text">
                            {currentResult.calories}
                          </div>
                          <div className="text-sm text-ios-secondary">Calories</div>
                        </div>
                      )}
                      {currentResult.protein && (
                        <div className="text-center p-3 bg-ios-bg rounded-lg">
                          <div className="text-2xl font-bold text-ios-text">
                            {currentResult.protein}g
                          </div>
                          <div className="text-sm text-ios-secondary">Protein</div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 mt-6">
                    <Button
                      onClick={() => setAnalysisResult(null)}
                      variant="outline"
                      className="flex-1"
                    >
                      Analyze Another
                    </Button>
                    <Button 
                      className="flex-1 bg-health-green hover:bg-green-600 text-white"
                      onClick={() => {
                        // Log food functionality
                        toast({
                          title: "Food Logged!",
                          description: "Added to your daily food log.",
                        });
                      }}
                    >
                      Log Food
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

This implementation guide provides comprehensive step-by-step instructions for building the complete Veridect application. Each phase builds upon the previous one, creating a full-featured AI-powered food analysis platform with authentication, subscription management, gamification, and advanced AI features.