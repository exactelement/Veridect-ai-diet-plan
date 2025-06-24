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
- **AI Provider**: Google Gemini 1.5 Flash model with full personalization
- **Analysis Methods**: 
  - Camera capture for real-time analysis
  - Image upload from device gallery
  - Text-based food description
- **Personalization**: AI considers user's health goals, dietary preferences, allergies, and subscription tier
- **Smart Responses**: Dynamic witty responses for non-food items with creative humor styles
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
- **Leaderboard Rankings**: Clear position indicators (#1, #2, #3) with rank calculations
- **Proper Spacing**: Fixed button visibility issues with appropriate bottom margins

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

### Container Configuration
- **Base Image**: Node.js 20 Alpine for minimal footprint
- **Security**: Non-root user execution with proper signal handling
- **Health Checks**: Built-in health endpoint monitoring
- **Resource Limits**: 2Gi memory, 2 vCPU for optimal performance
- **Auto-scaling**: 0-20 instances based on demand

### Cloud Run Deployment
- **Region**: europe-west1 (optimal for European users)
- **Container Registry**: Artifact Registry with automated builds
- **CI/CD**: Cloud Build integration with automated deployment
- **Environment**: Production-ready with proper environment variable management
- **Monitoring**: Cloud Logging and health check integration

### Configuration Management
- **Environment Variables**: Centralized configuration for API keys and database URLs
- **Build Scripts**: Automated build process with dependency installation
- **Port Configuration**: Port 5000 for development, port 8080 for Cloud Run production
- **Deployment Scripts**: `deploy-cloudrun.sh` for automated deployment
- **Local Testing**: `docker-build-test.sh` for container validation

## User Preferences

Preferred communication style: Simple, everyday language.

## Point System Architecture

**Dual Point Tracking System:**
- **Lifetime Points (totalPoints)**: NEVER RESET - accumulate forever for level progression (1000 points per level)
- **Weekly Points**: RESET every Monday - used for leaderboard competition and weekly progress tracking
- **Point Addition Rule**: Same points added to both systems during each week (food logging + bonus challenges)
- **Weekly Reset Behavior**: Weekly points start at 0 every Monday, lifetime points continue accumulating
- **Consistent Scoring**: YES=10, OK=5, NO=2 points plus bonus points from challenges added to both systems

**Point Sources:**
1. Food Analysis: Points added to both lifetime and weekly when user clicks "Yum" button
2. Bonus Points: Challenges, streaks, achievements (via updateUserPoints function) - added to both systems
3. Future: Daily challenges, referral bonuses, subscription perks

## Development Status - Patent Pending

### Stripe Configuration Status (June 24, 2025)
- **Live Mode Status**: CONFIRMED LIVE ✅ - Real payment processing active
- **Pro Tier**: OPERATIONAL ✅ - €1/month subscriptions being processed
- **Active Subscriptions**: 2 users with pending Pro upgrades in system
- **Webhook Processing**: LIVE WEBHOOKS ✅ - Real payment confirmations working
- **Advanced Tier**: Coming Soon (€50/month) - Price ID not needed yet
- **Revenue Status**: COLLECTING REAL REVENUE - Payment system fully operational
- **Security**: Live payment flow secure with proper webhook verification

## Development Status - Patent Pending
- **Build Status**: Production build completed successfully with optimized assets
- **Tier System**: Complete subscription tier enforcement with consistent pricing (€1/month Pro promotional - normally €10/month)
- **Authentication System**: Comprehensive multi-provider authentication with intelligent conflict detection
  - Email/Password ↔ Google ↔ Apple ID: Smart error messages guide users to correct sign-in method
  - Database schema updated with authentication and privacy fields
  - All authentication conflicts handled with specific user guidance
- **Bug Fixes**: Fixed food logging scope error in challenge function (June 24, 2025)
- **Documentation Organization**: Non-essential files moved to `/info-files/` folder for cleanup
- **Mobile Development**: Updated iOS and Android development guides with authentication integration
- **Custom Domain**: Configured application for `veridect.com` domain with proper OAuth redirects and email links
- **Onboarding Flow**: 4-step process ending with subscription tier selection (Free vs Pro upgrade option)
- **Frontend Protection**: Added subscription checks to Progress and Leaderboard page routes
- **Backend Security**: All premium API endpoints require proper tier validation
- **Feature Mapping**: Fixed subscription limits feature categorization for accurate error messages
- **Access Control**: Free tier limited to 5 analyses/day with basic features, Pro and Advanced get unlimited access to everything
- **Pro Features**: Unlimited analyses, food logging, challenges, leaderboard, personalization, progress tracking
- **Advanced Tier**: Properly disabled with "Coming Soon" messaging across all components
- **Pricing Consistency**: Unified €1/month promotional pricing across all pages and components
- **Personalization Logic**: AI analysis respects tier-based personalization with safety-first allergies
- **Database Schema**: Optimized with proper challenge tracking and bonus point recording
- **Authentication**: Replit Auth fully functional with session management and privacy controls
- **Deployment Ready**: Cloud Run scripts and Docker configuration prepared for post-patent launch
- **Patent Protection**: App remains private until Spanish patent application is filed
- **Authentication Flow**: Fixed all landing page buttons to redirect to functional login page (/login) with Apple, Google, and email options
- **Container Security**: Multi-stage build with non-root execution and health monitoring ready

## OAuth Authentication Status

### Google OAuth & Apple Sign-In Implementation (June 24, 2025)
- **Frontend Integration**: Complete implementation with proper error handling and loading states
- **Backend Support**: Full Passport.js integration with session management 
- **Configuration Check**: System detects missing credentials and shows helpful messages
- **Graceful Fallback**: Clear user guidance to email registration when OAuth unavailable
- **Account Linking**: Existing users can link OAuth accounts to email-based accounts
- **Error Handling**: Comprehensive error messages for all failure scenarios
- **Setup Documentation**: Created OAUTH_SETUP_GUIDE.md with step-by-step instructions
- **User Experience**: OAuth buttons always visible with tooltips, no broken functionality
- **Security**: Proper JWT verification for Apple, OAuth 2.0 flow for Google
- **Status**: Ready for production once API credentials are added

**Required for Activation:**
- Google: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` environment variables
- Apple: `VITE_APPLE_CLIENT_ID` environment variable

## Recent Changes

### Authentication Account Linking Fix (June 24, 2025)
- **Critical Fix**: Google OAuth now properly links to existing email accounts instead of creating duplicates
- **Database Cleanup**: Removed duplicate Google user accounts for existing email users
- **Schema Update**: Added googleId, authProvider, and profileImageUrl to updateUserProfile schema
- **User Experience**: Users with existing email accounts can now seamlessly sign in with Google without losing data or being sent to onboarding
- **Onboarding Flow**: Fixed issue where returning users were incorrectly sent to onboarding after Google sign-in

### Subscription Management with Stripe Integration (June 24, 2025)
- **Pricing Structure**: Free (€0), Pro (€1/month promotional), Advanced (€50/month)
- **Subscription Limits**: Free users limited to 5 daily analyses, paid tiers get unlimited access
- **Stripe Integration**: Complete payment processing with webhooks for subscription updates
- **Usage Tracking**: Real-time usage limits display with upgrade prompts for free users
- **Feature Gating**: Advanced AI features, detailed nutrition, and export capabilities tied to subscription tiers
- **Promotional Pricing**: Pro tier at €1/month (normally €10) for 1-year promotional launch period

### Auto-Capitalization for Name Fields (June 24, 2025)
- **Registration Form**: First and last name fields automatically capitalize first letter and lowercase the rest
- **Profile Page**: Name editing fields now apply proper capitalization formatting
- **User Experience**: Consistent name formatting across all input fields without requiring manual correction
- **Implementation**: Real-time capitalization as user types, ensuring proper name formatting

### UI/UX Improvements - Food Analysis Enhancement (June 24, 2025)
- **Weekly Rank Display**: Fixed weekly rank calculation to show actual position numbers (#1, #2, #3) instead of "#-"
- **Greeting Spacing**: Fixed trailing space issue in user greeting by trimming firstName field and updating database
- **Non-Food AI Responses**: Enhanced AI to generate creative, witty responses for non-food items with dynamic humor styles
- **Analysis Page Layout**: Added bottom padding (pb-32) to prevent "Analyze Another Food" and "Back to Dashboard" buttons from being hidden behind footer
- **Database Cleanup**: Removed trailing spaces from all user names and implemented .trim() in upsertUser and updateUserProfile functions

### Leaderboard Position Rankings - Visual Enhancement (June 24, 2025)
- **Position Indicators**: Added numbered position badges (#1, #2, #3, etc.) to each leaderboard entry
- **Visual Hierarchy**: Enhanced rank icons with position overlays for clear ranking display
- **User Experience**: Users can now clearly see their exact position in weekly competition
- **Ranking Logic**: Frontend calculates positions from sorted backend data for accurate display
- **Leaderboard Cleanup**: Removed "Weekly challenge participant" text for cleaner interface

### App Icon & PWA Setup - Veridect Branding (June 24, 2025)
- **App Icon**: Implemented Veridect logo as favicon and app icon across all platforms
- **PWA Manifest**: Added Progressive Web App manifest for mobile installation
- **SEO Meta Tags**: Enhanced with proper title, description, and Open Graph tags
- **Multi-Platform Icons**: Apple Touch Icons, Android Chrome icons, and PWA support
- **Brand Consistency**: Veridect green theme color (#10b981) throughout app metadata

### Email Service Implementation - Password Reset (June 24, 2025)
- **Email Service**: Implemented SendGrid email service for password reset functionality
- **Professional Templates**: HTML and text email templates with Veridect branding
- **Development Mode**: Falls back to console logging when SendGrid API key not configured
- **Security**: Proper token generation with 1-hour expiration
- **User Experience**: Clear messaging about whether emails are sent or in development mode
- **URL Generation**: Fixed to use proper Replit domain instead of localhost in email links
- **Sender Verification**: Requires verified sender identity in SendGrid for email delivery

### Fixed Authentication Error Handling - Login & Registration (June 24, 2025)
- **Root Issue**: apiRequest function was throwing errors on non-200 responses, breaking both login and registration error handling
- **Login Fix**: Replaced apiRequest with direct fetch for login to properly handle 401 responses
- **Registration Fix**: Replaced apiRequest with direct fetch for registration to properly handle 409 responses
- **Duplicate Detection**: Now correctly shows "Email Already Registered" message with login suggestion
- **Login Errors**: Now properly displays "Invalid email or password" instead of generic network errors
- **Consistent Architecture**: Both login and registration use direct fetch for proper response handling

### Data Consistency Fix - Registration vs Onboarding (June 24, 2025)
- **UX Issue Resolved**: Removed duplicate name collection from onboarding flow
- **Data Integrity**: Registration names are now authoritative source (no overwrite risk)
- **Streamlined Flow**: Onboarding reduced from 4 steps to 3 steps
- **Clear Separation**: Registration handles identity, onboarding handles health preferences
- **Consistent Data**: Eliminates confusion from collecting same data twice

### Comprehensive Bonus Point System Implementation (June 24, 2025)
- **3 YES Foods in a Row Challenge**: Added 50 bonus points for achieving 3 consecutive YES food choices
- **Multiple Analysis Challenges**: 5 analyses (25 points), 10 analyses (50 points), 5 YES foods today (100 points)
- **Proper Bonus Tracking**: Created daily_bonuses table to prevent duplicate awards and track achievement history
- **Dual Point Integration**: All bonus points correctly added to both lifetime points (level progression) and weekly points (competition)
- **Badge Counter Enhancement**: Updated progress page to show accurate bonus points and achievement badges earned
- **Challenge Detection Logic**: Implemented proper streak detection and challenge completion verification

### Double Counting Fix & Badge System (June 24, 2025)
- **Root Cause**: `updateUserPoints` was adding points to weekly scores, then `updateWeeklyScore` added same points again
- **Solution**: Modified `updateUserPoints` to handle only lifetime points, kept `updateWeeklyScore` for food logging
- **Challenge Fixes**: Updated all challenge functions to explicitly add bonus points to both lifetime and weekly
- **Point Flow**: Food logging uses both functions, challenge bonuses use both functions, no double counting
- **Badge System**: Fixed progress page to correctly count completed challenges (3 challenges = 3 badges)
- **UI Updates**: Added missing 10 analyses challenge to progress page with proper visual indicators

### Docker Container & Cloud Run Deployment (June 24, 2025)
- **Production Container**: Built optimized multi-stage Docker container for Cloud Run deployment
- **Security Hardening**: Non-root user execution, proper signal handling with dumb-init, health checks
- **Cloud Build Integration**: Automated CI/CD pipeline with Google Cloud Build and Artifact Registry
- **Deployment Automation**: Complete deployment scripts with `deploy-cloudrun.sh` and local testing tools
- **Resource Configuration**: Optimized for AI workloads with 2Gi memory, 2 vCPU, 0-20 auto-scaling
- **European Deployment**: europe-west1 region for optimal performance and GDPR compliance
- **Environment Management**: Production-ready configuration with secure environment variable handling

### Authentication System Fix (June 24, 2025)
- **API Authentication Resolution**: Fixed all 400 status code errors across food analysis, logging, and user endpoints
- **User ID Extraction**: Corrected authentication middleware to properly extract user ID from session claims
- **Session Validation**: Updated isAuthenticated middleware to handle session-based auth without token expiry requirements
- **Endpoint Verification**: All API routes now respond correctly with proper 200/304 status codes
- **System Stability**: Food tracking, leaderboards, and user data APIs fully operational

### AI Personality Enhancement (June 23, 2025)
- **Humorous Food Analysis**: Enhanced Gemini AI prompts to include humor and personality in food verdicts
- **Concise Witty Responses**: Limited explanations to maximum 6 lines with punchy, memorable phrases
- **Eliminated Scary Language**: Replaced frightening "Red flag" responses with encouraging, playful alternatives
- **JSON Parsing Fix**: Corrected Gemini API errors by enforcing whole number format requirements
- **Creative Variety System**: Added 20+ different opening phrases to prevent repetitive responses
- **Dynamic Response Generation**: Implemented randomized creative openings for both AI and fallback responses
- **Non-Food Detection**: Non-food items receive "NO" verdict with clear rejection messages
- **Food & Drink Analysis**: System analyzes all edible food items AND beverages (including water, coffee, juice, alcohol)
- **Enhanced User Protection**: Prevents logging of non-food items with appropriate error messages
- **UI Consistency**: Non-food items show "N/A cal" in food history and single "Try Again" button
- **Tone Guidelines Update**: Removed rigid example phrases, added variety requirements for spontaneous creativity
- **User Experience Improvement**: Food analysis provides entertaining, supportive feedback that motivates rather than scares

### Daily Reset System Implementation (June 23, 2025)
- **Madrid Time Zone Compliance**: All resets occur at midnight Madrid time for European users
- **Data Preservation**: All food logs preserved permanently for history tracking in profile page
- **Daily View Filtering**: Only "Today's Food Log" and daily calories reset to 0 at midnight
- **Smart Date Filtering**: getTodaysFoodLogs() function filters by current date without deleting data
- **Weekly Points Reset**: Weekly leaderboard resets every Monday at midnight Madrid time
- **Server Integration**: Scheduler starts with server and handles graceful shutdown
- **Historical Data Intact**: Complete food analysis history maintained for user progress tracking

### Weekly Challenge System Fixes (June 23, 2025)
- **Fixed Total Score Display**: Homepage and leaderboard now correctly show weekly points (resets Monday)

### Point System Accuracy Fix (June 24, 2025)
- **Fixed Weekly Points Calculation**: Eliminated systematic 2-point error in weekly score updates
- **Duplicate Bonus Prevention**: Added one-time-only bonus award system with tracking to prevent duplicate challenge rewards
- **Point System Validation**: Both lifetime and weekly points now calculate accurately with YES=10, OK=5, NO=2 rules
- **Challenge System Integrity**: 5-analyses bonus awarded exactly once per day with proper validation
- **Mathematical Accuracy**: Point counters, challenges, and bonus systems all working correctly with precise calculations
- **Daily Reset Enhancement**: Progress wheel, counters, and today's log list now properly reset at Madrid midnight
- **Weekly Reset Distinction**: Weekly progress sections (challenges, health score, competitions) reset Monday midnight, not daily
- **Madrid Timezone Consistency**: All daily and weekly views use Madrid timezone for accurate progress tracking
- **Proper Reset Scheduling**: Daily progress (midnight) vs Weekly progress (Monday midnight) clearly separated
- **Corrected Point System**: Dual tracking - lifetime points (never reset) vs weekly points (reset Monday)
- **Weekly Challenge Participation**: Users can opt out and be automatically removed from leaderboard
- **Real-time Leaderboard Updates**: Toggling participation instantly refreshes leaderboard display
- **Madrid Time Zone Compliance**: All weekly resets occur at Monday 00:00 Madrid time
- **Yes/OK/No Counter Accuracy**: Leaderboard displays correct verdict counts from actual food logging

### UX Improvements & Bug Fixes (June 23, 2025)
- **Fixed "Yum" Button UX**: Eliminated blank screen during food logging with smooth client-side navigation
- **Immediate Visual Feedback**: Analysis stays visible during API calls with loading states on buttons
- **Translation Widget Removed**: Disabled translation feature due to MyMemory API rate limits
- **Complete Analysis Reset**: Both "Yum" and "Nah" buttons now clear analysis card AND uploaded photos
- **File Input Reset**: File inputs properly cleared to prevent cached image display
- **Profile Settings Reorder**: Show Food Statistics moved above Weekly Challenge Participation
- **Smooth Navigation**: Replaced page reloads with seamless transitions using wouter routing
- **Reduced Loading Times**: Removed artificial delays and optimized user interaction flow
- **Food History Filtering**: Added isLogged field to track only foods clicked "Yum" vs just analyzed
- **Database Schema Update**: Profile food history now shows only actually logged foods, not all analyzed items

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