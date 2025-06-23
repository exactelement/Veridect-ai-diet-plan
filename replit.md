# YesNoApp - AI-Powered Food Analysis Platform

## Overview

YesNoApp is a health-focused web application that provides instant AI-powered food analysis and nutritional guidance. Users can analyze food through photos, uploads, or text descriptions to receive simple "Yes", "No", or "OK" verdicts with detailed explanations. The platform combines modern React frontend with Express.js backend, featuring user authentication, subscription management, and comprehensive food logging capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Library**: Shadcn/UI components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system (iOS-inspired)
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js 20 with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Replit Auth integration with session-based authentication
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **AI Integration**: Google Gemini AI for food analysis and image recognition

### Database Design
- **ORM**: Drizzle with PostgreSQL dialect
- **Schema**: Shared TypeScript schemas between client and server
- **Key Tables**:
  - `users`: User profiles, preferences, subscription data
  - `sessions`: Session storage for authentication
  - `foodLogs`: Food analysis history and results
  - `weeklyScores`: Leaderboard and progress tracking

## Key Components

### Authentication System
- **Provider**: Replit Auth with OpenID Connect
- **Session Management**: PostgreSQL-backed session store
- **User Onboarding**: Multi-step profile setup with health goals and dietary preferences
- **Authorization**: Route-based protection with middleware

### Food Analysis Engine
- **AI Provider**: Google Gemini 1.5 Flash model
- **Analysis Methods**: 
  - Camera capture for real-time analysis
  - Image upload from device gallery
  - Text-based food description
- **Fallback System**: Local food database for when AI is unavailable
- **Result Processing**: Structured JSON responses with nutritional data and confidence scores

### Subscription Management
- **Payment Processor**: Stripe integration
- **Tiers**: Free (5 analyses/day), Pro ($19.99), Medical ($49.99)
- **Features**: Usage tracking, tier-based feature access, subscription webhooks

### User Interface
- **Design System**: iOS-inspired with custom CSS variables
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Component Library**: Consistent UI components with accessibility features
- **Progressive Enhancement**: Graceful degradation for older browsers

## Data Flow

1. **User Authentication**: Replit Auth → Session creation → User profile retrieval
2. **Food Analysis**: User input → AI processing → Result storage → UI update
3. **Subscription Flow**: Stripe checkout → Webhook processing → User tier update
4. **Progress Tracking**: Analysis results → Weekly scoring → Leaderboard updates

## External Dependencies

### Core Services
- **Replit Auth**: User authentication and profile management
- **Google Gemini AI**: Food analysis and image recognition
- **Stripe**: Payment processing and subscription management
- **Neon Database**: PostgreSQL hosting with serverless architecture

### Development Tools
- **TypeScript**: Type safety across the stack
- **Drizzle Kit**: Database migrations and schema management
- **ESBuild**: Server-side bundling for production
- **PostCSS**: CSS processing with Tailwind

### UI Dependencies
- **Radix UI**: Accessible component primitives
- **TanStack Query**: Server state synchronization
- **React Hook Form**: Form validation and submission
- **Wouter**: Lightweight routing solution

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 runtime
- **Database**: Replit PostgreSQL instance
- **Development Server**: Concurrent client/server development with Vite HMR

### Production Build
- **Frontend**: Vite production build with asset optimization
- **Backend**: ESBuild bundling for Node.js deployment
- **Static Assets**: Served from Express with proper caching headers
- **Environment**: Replit autoscale deployment target

### Configuration Management
- **Environment Variables**: Centralized configuration for API keys and database URLs
- **Build Scripts**: Automated build process with dependency installation
- **Port Configuration**: Port 5000 for development, port 80 for production

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- June 23, 2025: Consistent verdict system and optimized food analysis
  - Implemented smart caching with user profile fingerprinting for consistent verdicts
  - Same food now provides identical analysis results for each user's specific profile
  - Added deterministic seeding to AI analysis for reproducible results
  - Enhanced image fingerprinting using multiple sample points for better consistency
  - Fixed duplicate food logging - only logs when user clicks "Yum" button
  - Added auto-dismiss functionality to all error messages (4 second duration)
  - Enhanced navigation with instant scroll-to-top on all tab clicks
  - Cache system maintains 500 entries with personalized verdicts per user profile
  - Authentication system fully working with proper session management
- June 23, 2025: Fixed white text visibility issues on landing page and about page CTA sections
  - Replaced problematic gradient backgrounds with solid blue backgrounds
  - Ensured proper text contrast for "Ready to Transform Your Health?" sections
  - Fixed subscription tier card styling with white background and dark text
- June 20, 2025: Complete multi-provider authentication system and deployment guides updated
  - Apple Sign-In JavaScript SDK integration with frontend authentication flow
  - Complete Apple authentication with JWT token processing and user account creation
  - Updated all deployment guides with Apple Developer and Google OAuth credentials
  - Added authentication secrets to GCP, GitHub Actions, and Docker deployment configurations
  - Updated iOS and Android development guides with multi-provider authentication
  - Production-ready authentication system supporting Email/Password, Apple Sign-In, and Google OAuth
- June 20, 2025: Responsive navigation implemented on landing page
  - Desktop (large screens): Full navigation menu visible in header
  - Medium screens: Menu items moved to dropdown with "Menu" button  
  - Mobile screens: Menu items moved to slide-out panel with hamburger menu
  - Login button always visible and stays in header at all screen sizes
  - Logo/name clickable to refresh page with hover effects
- June 20, 2025: Food analysis page layout fixed
  - Added proper bottom padding (pb-24) to prevent content from hiding behind sticky footer navigation
  - Ensures all buttons and text are fully visible and accessible on mobile devices
- June 20, 2025: GDPR compliance system implemented
  - First-time GDPR banner appears only once after registration login
  - Personalized data sharing options specific to YesNoApp features
  - Essential data collection notice in privacy page with Terms of Service reference
  - Four targeted consent options: AI training, nutrition emails, usage analytics, community database
  - Database tracking prevents banner from showing again after initial consent
- June 20, 2025: Weekly leaderboard competition system completed
  - Real participant counts from database instead of hardcoded values
  - Madrid timezone Monday 00:00 challenge reset timing implemented
  - Trophy icons added for top 3 positions (🏆🥈🥉)
  - Live ranking updates when users earn points through food analysis
  - Weekly scoring system with automatic rank recalculation
- June 20, 2025: Complete authentication system and enhanced navigation implemented
  - Fixed double X button issue in retractable menu
  - Enhanced top header with YesNoApp branding and smooth menu functionality
  - Sticky footer navigation with Home, Analyse, Progress, Leaderboard, Profile tabs
  - Investor presentation page with comprehensive metrics and roadmap
  - GDPR privacy page with functional account deletion and data export
  - AI disclaimer page explaining educational limitations and professional guidance
  - Resolved Replit Auth callback 404 error by switching to multi-auth system
  - Authentication working with email/password login and session management
  - Fixed onboarding completion errors and logout redirect functionality
  - Complete user flow: Registration → Login → Onboarding → Main app → Logout
- June 19, 2025: Authentication system completed and verified working
  - Multi-provider authentication (Google, Apple, Replit, email/password)
  - Password recovery with secure reset tokens
  - GDPR compliance with granular consent options
  - User registration, login, and password management fully functional
  - Database schema updated with authentication and privacy fields
- June 19, 2025: Initial setup