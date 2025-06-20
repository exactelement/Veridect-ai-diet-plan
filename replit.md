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
- June 20, 2025: Enhanced navigation system completed and authentication issues resolved
  - Fixed double X button issue in retractable menu
  - Enhanced top header with YesNoApp branding and smooth menu functionality
  - Sticky footer navigation with Home, Analyse, Progress, Leaderboard, Profile tabs
  - Investor presentation page with comprehensive metrics and roadmap
  - GDPR privacy page with functional account deletion and data export
  - AI disclaimer page explaining educational limitations and professional guidance
  - Resolved Replit Auth callback 404 error by switching to multi-auth system
  - Authentication now working with Google OAuth and email/password login
- June 19, 2025: Authentication system completed and verified working
  - Multi-provider authentication (Google, Apple, Replit, email/password)
  - Password recovery with secure reset tokens
  - GDPR compliance with granular consent options
  - User registration, login, and password management fully functional
  - Database schema updated with authentication and privacy fields
- June 19, 2025: Initial setup