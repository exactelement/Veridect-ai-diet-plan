# Veridect - AI-Powered Food Analysis Platform

## Overview

Veridect is a health-focused web application that provides instant AI-powered food analysis and nutritional guidance with comprehensive multi-language support. Users can analyze food through photos, uploads, or text descriptions to receive simple "Yes", "No", or "OK" verdicts with detailed explanations in 20+ languages. The platform combines modern React frontend with Express.js backend, featuring user authentication, subscription management, comprehensive food logging capabilities, and real-time translation across all pages and components.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Library**: Shadcn/UI components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system (iOS-inspired)
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Translation System**: Custom in-app translation with MyMemory API integration
- **Internationalization**: 20+ languages with real-time text replacement and persistence

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
- **Translation Widget**: Floating bottom-right widget with minimize/maximize functionality
- **Multi-language Support**: Real-time text replacement across all pages and components

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
- **Container**: Multi-stage Docker build for optimized production images
- **Deployment**: Google Cloud Run with autoscaling and health checks

### Configuration Management
- **Environment Variables**: Centralized configuration for API keys and database URLs
- **Build Scripts**: Automated build process with dependency installation
- **Port Configuration**: Port 5000 for development, port 8080 for Cloud Run production
- **Container Configuration**: Docker multi-stage builds with security hardening
- **Cloud Deployment**: Automated Cloud Run deployment with CI/CD integration

## User Preferences

Preferred communication style: Simple, everyday language.

## Point System Architecture

**Unified Point Tracking:**
- All points (food logging + bonus points) accumulate to `totalPoints` field for lifetime tracking
- Weekly points: ALL points earned this week (food + bonus), resets every Monday
- Level calculation: 1000 points per level using lifetime totalPoints
- Consistent scoring: YES=10, OK=5, NO=2 points across all systems

**Point Sources:**
1. Food Analysis: Automatic when user clicks "Yum" button
2. Bonus Points: Achievements, streaks, challenges (via updateUserPoints function)
3. Future: Daily challenges, referral bonuses, subscription perks

## Deployment Ready Status
- **Build Status**: Successfully building with npm run build
- **Docker Configuration**: Multi-stage Dockerfile optimized for Cloud Run
- **Stripe Integration**: Temporarily disabled for deployment compatibility
- **Translation System**: Fully functional with 20+ languages
- **Authentication**: Replit Auth integration working
- **Database**: PostgreSQL schema and operations ready

## Recent Changes

### AI Personality Enhancement (June 23, 2025)
- **Humorous Food Analysis**: Enhanced Gemini AI prompts to include humor and personality in food verdicts
- **Concise Witty Responses**: Limited explanations to maximum 6 lines with punchy, memorable phrases
- **Eliminated Scary Language**: Replaced frightening "Red flag" responses with encouraging, playful alternatives
- **JSON Parsing Fix**: Corrected Gemini API errors by enforcing whole number format requirements
- **Creative Variety System**: Added 20+ different opening phrases to prevent repetitive responses
- **Dynamic Response Generation**: Implemented randomized creative openings for both AI and fallback responses
- **Tone Guidelines Update**: Removed rigid example phrases, added variety requirements for spontaneous creativity
- **User Experience Improvement**: Food analysis provides entertaining, supportive feedback that motivates rather than scares

### UX Improvements & Bug Fixes (June 23, 2025)
- **Fixed "Yum" Button UX**: Eliminated blank screen during food logging with smooth client-side navigation
- **Immediate Visual Feedback**: Analysis stays visible during API calls with loading states on buttons
- **Translation Widget Removed**: Disabled translation feature due to MyMemory API rate limits
- **Complete Analysis Reset**: Both "Yum" and "Nah" buttons now clear analysis card AND uploaded photos
- **File Input Reset**: File inputs properly cleared to prevent cached image display
- **Smooth Navigation**: Replaced page reloads with seamless transitions using wouter routing
- **Reduced Loading Times**: Removed artificial delays and optimized user interaction flow

### Translation System (June 23, 2025) - REMOVED
- **API Rate Limit Issues**: MyMemory API exceeded daily free translation limits
- **Service Unavailable**: "YOU USED ALL AVAILABLE FREE TRANSLATIONS FOR TODAY" error message
- **Feature Disabled**: Completely removed translation widget and provider to prevent errors
- **Future Consideration**: May implement paid translation service or alternative provider later

### User Experience Improvements (June 23, 2025)
- **Fixed Subscription Pricing Display**: Eliminated duplicate "Free" text in subscription tiers
- **Corrected Weekly Challenge Countdown**: Proper Madrid timezone handling for Monday resets
- **Enhanced Point System Integration**: Unified lifetime and weekly point tracking
- **Improved Navigation**: Instant scroll-to-top on tab clicks with smooth transitions

### Technical Architecture Updates (June 23, 2025)
- **Translation Context Provider**: Global React context for translation state management
- **localStorage Integration**: Persistent translation cache and language preferences
- **API Rate Limiting**: Built-in delays and batch processing for translation requests
- **Performance Optimization**: Debounced retranslation and intelligent cache management
- **Error Handling**: Comprehensive fallback mechanisms for translation failures

### Production Deployment Infrastructure (June 23, 2025)
- **Docker Containerization**: Multi-stage Docker builds with Alpine Linux base
- **Google Cloud Run**: Serverless container deployment with autoscaling
- **Health Monitoring**: Built-in health check endpoints for container orchestration
- **Graceful Shutdown**: Proper signal handling for SIGTERM/SIGINT in containers
- **Security Hardening**: Non-root user execution and minimal container footprint
- **CI/CD Pipeline**: Automated Cloud Build integration with GitHub triggers
- **Port Configuration**: Updated to use Cloud Run standard port 8080

## Historical Changelog
- June 23, 2025: Implemented in-app live translation system for multi-language support
  - Real-time text replacement within the app (no new tabs or page reloads)
  - 20+ languages including Spanish, French, German, Chinese, Arabic, Hindi, Japanese
  - Uses MyMemory translation API with intelligent caching for performance
  - Floating widget with minimize/maximize functionality positioned bottom-right
  - Translation preserves app functionality while changing all visible text
  - Smart text node detection that skips code, scripts, and non-translatable content
  - Reset functionality to return to original English content
  - Widget appears for all users with translation context provider
  - Global language persistence: selected language maintained across all pages
  - Auto-translation on page load when non-English language is selected
  - LocalStorage caching for translations and language preference
- June 23, 2025: Fixed duplicate "Free" text in subscription tier pricing display
  - Free tier now shows "Free" as title and "€0" as price (eliminated duplication)
  - Consistent pricing format across all subscription tiers
- June 23, 2025: Fixed weekly challenge countdown to properly handle Madrid timezone reset schedule
  - Monday shows 7 days remaining (week just reset at 00:00 Madrid time)
  - Sunday shows 1 day remaining (last day before Monday reset)
  - Accurate countdown calculation for all days until next Monday 00:00 Madrid time
  - System correctly handles both summer (UTC+2) and winter (UTC+1) timezone offsets
- June 23, 2025: Complete point system implementation and bonus points integration
  - Added all missing achievement bonus points (225 total: first analysis, milestones at 5/10/25 analyses)
  - Verified point calculations: 192 food points + 225 bonus points = 417 lifetime total
  - Weekly and lifetime totals now properly synchronized and accumulating naturally
  - System ready for organic point accumulation from all sources (food logging + bonus achievements)
  - Level progression: 417/1000 points toward Level 2
- June 23, 2025: Unified point system implementation
  - Fixed weekly points to include ALL points earned that week (food logging + bonus points)
  - Updated updateWeeklyScore function to accumulate any point source, not just food verdicts
  - Level calculation uses lifetime totalPoints with 1000 points per level
  - Weekly leaderboard resets every Monday and tracks complete weekly accumulation
  - Both systems now use identical point values with proper weekly/lifetime separation
- June 23, 2025: Complete rebranding from YesNoApp to Veridect
  - App name changed to Veridect throughout all pages and components
  - Contact information updated to info@veridect.com and +34672810584
  - Founder and CEO listed as Michael Bright (Valencia-based entrepreneur)
  - Medical tier pricing corrected to €49.99 to match home page
  - All pricing converted to euros for European launch
  - Investor roadmap updated: Q2 private beta, Q3 public beta ongoing, targeting 20K users
  - Funding target set to €2M for growth and team expansion
  - Location updated to Valencia, ES
  - Veridect logo integrated across landing page and navigation
  - Recognition and awards section commented out as requested
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
- June 23, 2025: Updated logo and messaging throughout the app
  - Implemented new Veridect logo (veridect_logo_1750694541716.PNG) across all pages
  - Changed all subscription pricing from $ to € (Free, €19.99 Pro, €49.99 Medical)
  - Updated messaging: "bring awareness to healthier nutrition and provide advanced nutrition guidance"
  - Removed "Yes/No" simplification messaging in favor of comprehensive nutrition guidance
  - Updated "Health First" value text to remove "above profit" reference
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
  - Personalized data sharing options specific to Veridect features
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