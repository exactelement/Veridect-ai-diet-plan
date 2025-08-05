# Veridect - AI-Powered Food Analysis Platform

## Overview
Veridect is a live revenue-generating AI-powered nutrition analysis platform designed to bring awareness to healthier nutrition. It enables users to analyze food via photos, uploads, or text, providing simple "Yes," "No," or "OK" verdicts with detailed explanations in 20+ languages. The platform integrates a modern React frontend with an Express.js backend, offering user authentication, subscription management (including Pro tier), comprehensive food logging, real-time translation, and patent-pending AI technology. Veridect is currently serving paying customers and aims to scale for 100k users and 20k paying customers, targeting significant market potential with a strong LTV:CAC ratio and gross margins.

## User Preferences
Preferred communication style: Simple, everyday language.
Documentation: User requests detailed technical documentation for Fiverr developers to build complete app with all features.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, built with Vite.
- **UI/Styling**: Shadcn/UI components (built on Radix UI) styled with Tailwind CSS, utilizing an iOS-inspired custom design system.
- **State Management**: TanStack Query for server state, React Hook Form with Zod for form handling.
- **Routing**: Wouter for lightweight client-side routing.
- **Internationalization**: Custom in-app translation with 20+ languages, persistent language preferences, and a floating translation widget.

### Backend Architecture
- **Runtime**: Node.js 20 with Express.js and TypeScript.
- **Authentication**: Replit Auth integration with PostgreSQL-backed session management, supporting multi-provider (Google, Apple, email/password) authentication.
- **Database**: PostgreSQL with Drizzle ORM for type-safe operations. Key tables include `users`, `sessions`, `foodLogs`, and `weeklyScores`.
- **AI Integration**: Google Gemini 1.5 Flash model for food analysis and image recognition, personalized based on user preferences and subscription tier.
- **Payment Processing**: Stripe integration for subscription management (yearly billing).
- **Gamification**: Dual point system (lifetime and weekly points) for level progression and leaderboard competition, with bonus challenges and milestone rewards.
- **UI/UX Decisions**: Responsive, mobile-first design with consistent UI components, proper spacing, and accessibility features. Dynamic witty responses for non-food items and clear leaderboard position indicators.

### System Design Choices
- **Authentication**: Secure Replit Auth integration with session-based authentication, multi-step user onboarding, and route-based authorization.
- **Food Analysis Engine**: Uses Google Gemini 1.5 Flash for camera, image upload, and text-based analysis. Personalizes results based on user data (health goals, diet, allergies, tier). Includes smart, witty responses for non-food items and a local food database fallback.
- **Subscription Management**: Supports Free, Pro (€1/month billed yearly), and Advanced (€50/month) tiers with usage tracking and feature gating.
- **Data Flow**: Authenticates users, processes food analysis through AI, stores results, and updates UI. Manages subscriptions via Stripe webhooks and updates user tiers. Tracks progress by converting analysis results into weekly scores and leaderboard updates.
- **Security**: Focuses on session cookie security, CSRF protection, environment-based configuration, and robust user ID validation. Comprehensive security and data handling audits, including GDPR compliance efforts.
- **Timezone Consistency**: All daily and weekly resets (e.g., challenges, leaderboards) are consistently managed using the Madrid timezone.
- **Content Management**: Clarified free tier limitations, standardized tier naming, updated billing models, and ensured content consistency across the platform.

## External Dependencies

### Core Services
- **Replit Auth**: User authentication and profile management.
- **Google Gemini AI**: Food analysis and image recognition.
- **Stripe**: Payment processing and subscription management.
- **Neon Database**: PostgreSQL hosting (serverless).
- **SendGrid**: Email service for password resets.

### Development Tools
- **TypeScript**: Language for type safety.
- **Drizzle Kit**: Database migrations and schema management.
- **Vite**: Frontend build tool.
- **ESBuild**: Server-side bundling.
- **PostCSS**: CSS processing with Tailwind.

### UI Dependencies
- **Radix UI**: Accessible component primitives.
- **TanStack Query**: Server state synchronization.
- **React Hook Form**: Form validation and submission.
- **Wouter**: Lightweight routing solution.