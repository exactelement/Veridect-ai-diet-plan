# Veridect - AI-Powered Food Analysis Platform

## Overview
Veridect is a live revenue-generating AI-powered nutrition analysis platform. Its core purpose is to bring awareness to healthier nutrition by allowing users to analyze food via photos, uploads, or text, receiving simple "Yes," "No," or "OK" verdicts with detailed explanations in 20+ languages. The platform supports user authentication, subscription management (including a Pro tier), comprehensive food logging, and real-time translation, all powered by patent-pending AI technology. Veridect is currently serving paying customers and aims to scale to 100k users and 20k paying customers, with ambitious plans for infrastructure growth and market expansion.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Design Philosophy
Veridect employs an iOS-inspired design system with a mobile-first, responsive approach. It uses Shadcn/UI components built on Radix UI primitives and Tailwind CSS for styling, ensuring a consistent and accessible user experience. The design emphasizes clear position indicators for leaderboards, proper spacing, and a clean, professional aesthetic.

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI**: Shadcn/UI, Radix UI, Tailwind CSS
- **Routing**: Wouter
- **State Management**: TanStack Query
- **Form Handling**: React Hook Form with Zod validation
- **Internationalization**: Custom in-app translation system supporting 20+ languages with real-time text replacement and persistence, utilizing a floating widget for language selection.

### Backend
- **Runtime**: Node.js 20 with Express.js
- **Language**: TypeScript (ES modules)
- **Authentication**: Replit Auth integration with session-based authentication.
- **Database**: PostgreSQL with Drizzle ORM.
- **AI Integration**: Google Gemini AI (1.5 Flash model) for food analysis and image recognition, personalized based on user preferences. Witty responses are generated for non-food items.

### Database Design
- **ORM**: Drizzle with PostgreSQL.
- **Schema**: Shared TypeScript schemas for client/server.
- **Key Tables**: `users` (profiles, subscriptions), `sessions` (authentication), `foodLogs` (analysis history), `weeklyScores` (leaderboard/progress), `dailyBonuses` (challenge tracking).
- **Point System**: Dual point tracking with `totalPoints` (lifetime, never reset) and `weeklyPoints` (resets Monday) for level progression and leaderboard competition.

### Key Features & Technical Implementations
- **Authentication**: Replit Auth, PostgreSQL-backed sessions, multi-step user onboarding (health goals, dietary preferences), route-based authorization.
- **Food Analysis Engine**: Uses Google Gemini 1.5 Flash, supporting camera, image upload, and text input. Personalization considers user health goals, diet, allergies, and subscription tier. Includes a fallback to a local food database and structured JSON responses.
- **Subscription Management**: Stripe integration for yearly billing. Tiers include Free (limited analyses), Pro, and Advanced, with feature gating based on tier.
- **Gamification**: Comprehensive point system, daily bonuses, weekly challenges (e.g., YES streaks, analyses count), and milestone rewards. Leaderboard rankings are displayed for Pro tier users. Timezone consistency (Madrid time) is enforced for daily/weekly resets.
- **Email Management**: Profile email preferences, public unsubscribe page, and admin dashboard for consent management.
- **GDPR Compliance**: GDPR cookie banner, consent management (temporarily disabled but schema ready), with focus on EU compliance.
- **Containerization & Deployment**: Multi-stage Docker builds using Node.js 20 Alpine. Deployed on Google Cloud Run with autoscaling (0-20 instances), health checks, and CI/CD via Cloud Build. Optimized for `europe-west1`.

## External Dependencies

### Core Services
- **Replit Auth**: User authentication and profile management.
- **Google Gemini AI**: Food analysis, image recognition, and personalized responses.
- **Stripe**: Payment processing and subscription management.
- **Neon Database**: PostgreSQL hosting.
- **MyMemory API**: (Previously used for translation, currently disabled due to rate limits)
- **SendGrid**: Email service for password resets and user communication.

### Development Tools
- **TypeScript**: Language for type safety.
- **Drizzle Kit**: Database migrations and schema management.
- **ESBuild**: Server-side bundling.
- **PostCSS**: CSS processing.

### UI Libraries
- **Radix UI**: Accessible component primitives.
- **TanStack Query**: Server state synchronization.
- **React Hook Form**: Form validation and submission.
- **Wouter**: Lightweight routing.