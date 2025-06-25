# Veridect - AI-Powered Food Analysis Platform

A live revenue-generating nutrition analysis platform providing personalized "Yes/No/OK" food verdicts using Google Gemini AI. Currently serving paying customers with operational Pro tier subscriptions and patent-pending AI technology.

## 🚀 Live Status
- **Revenue**: Active payment processing via Stripe
- **Users**: 30+ registered users, 2 active Pro subscribers  
- **AI Analysis**: Google Gemini integration operational
- **Gamification**: Dual point system with weekly competitions

## Features

- 📸 **Food Analysis**: Analyze food through photos, uploads, or text descriptions
- 🤖 **AI-Powered**: Google Gemini AI with full personalization based on health goals
- 🏆 **Gamification**: Dual point system (weekly competition + lifetime progression)
- 💳 **Subscription Tiers**: Free (5/day), Pro (€1/month), Advanced (€50/month)
- 🔐 **Authentication**: Secure Replit Auth with session management
- 🌐 **Multi-language**: 20+ languages with real-time translation widget
- 📱 **Mobile-First**: iOS-inspired responsive design
- 🎯 **Challenges**: Streak tracking, daily challenges, bonus point system

## Point System Architecture

### Dual Tracking System
- **Weekly Points**: Reset every Monday, used for leaderboard competition
- **Total Points**: Accumulate forever for level progression (1000 points per level)
- **Scoring**: YES=10, OK=5, NO=2 points plus bonus challenges
- **Challenges**: 3 YES streak (50pts), 5 analyses (25pts), 10 analyses (50pts), 5 YES in day (100pts)

### Badge System
- Each completed challenge = 1 badge earned
- Progress tracking with achievement milestones
- Pro tier exclusive leaderboard participation

## Development

### Prerequisites
- Node.js 20+
- PostgreSQL database (Replit/Neon)
- Required API keys (Google Gemini, Stripe, etc.)

### Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in Replit Secrets:
```
DATABASE_URL=<neon_database_url>
GOOGLE_GEMINI_API_KEY=<gemini_api_key>
STRIPE_SECRET_KEY=<stripe_secret_key>
VITE_STRIPE_PUBLIC_KEY=<stripe_public_key>
STRIPE_PRO_PRICE_ID=<stripe_price_id>
STRIPE_WEBHOOK_SECRET=<webhook_secret>
SENDGRID_API_KEY=<sendgrid_api_key>
```

3. Run database migrations:
```bash
npm run db:push
```

4. Start the development server:
```bash
npm run dev
```

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and builds
- **Tailwind CSS** with iOS-inspired design system
- **Shadcn/UI** components built on Radix UI
- **TanStack Query** for server state management
- **React Hook Form** with Zod validation

### Backend
- **Node.js 20** with Express.js
- **TypeScript** with ES modules
- **PostgreSQL** with Drizzle ORM
- **Google Gemini AI** integration
- **Stripe** payment processing (yearly billing)
- **Replit Auth** with OpenID Connect
- **Session-based** authentication with PostgreSQL storage

### Database Schema
- **Users**: Profiles, preferences, subscription data, point tracking
- **Sessions**: Authentication session storage
- **Food Logs**: Analysis history and logging
- **Weekly Scores**: Leaderboard and competition tracking
- **Failed Webhooks**: Payment processing monitoring

## Architecture

### Data Flow
1. **Authentication**: Replit Auth → Session creation → User profile
2. **Food Analysis**: User input → Gemini AI → Result storage → Point awards
3. **Subscription**: Stripe checkout → Webhook processing → Tier update
4. **Gamification**: Analysis results → Point calculation → Leaderboard update

### Point System Pipeline
```
Food Logging → updateWeeklyScore() → Dual point addition → Challenge detection → Bonus awards
```

### Available Scripts

- `npm run dev` - Start development server (client + server)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio

## Deployment

### Google Cloud Run Production
The application is deployed on Google Cloud Run with:
- Multi-stage Docker build
- Auto-scaling 0-20 instances
- 2Gi memory, 2 vCPU allocation
- Health checks and monitoring
- Artifact Registry integration

### Container Configuration
```bash
# Build production image
docker build -t veridect .

# Run locally
docker run -p 8080:8080 veridect
```

### Environment Configuration
- **Development**: Port 5000, Replit environment
- **Production**: Port 8080, Cloud Run environment
- **Build**: Automated via Cloud Build integration

## Business Model

### Subscription Tiers
- **Free**: 5 analyses/day, basic features
- **Pro**: €1/month (€12/year) - Unlimited analyses, full gamification
- **Advanced**: €50/month - Enterprise features (coming soon)

### Revenue Status
- **Live Payments**: Stripe processing active
- **Current Revenue**: €24/year from active subscriptions
- **Growth**: 30+ registered users, expanding user base

### Performance Optimizations
- Subscription status caching (5-minute TTL)
- Reduced client polling (5-minute intervals)
- Optimized database queries
- Memory management improvements

## Support & Maintenance

### Monitoring
- Daily cleanup: Midnight Madrid time
- Weekly reset: Monday midnight Madrid time
- Health checks: Database, environment, memory
- Failed webhook tracking and resolution

### Documentation
- `replit.md` - Technical architecture and user preferences
- `SYSTEM_STATUS.md` - Current operational status
- Code comments and type definitions

## License

This project is proprietary and confidential. Patent pending on AI analysis methodology.

---

**Status**: ✅ FULLY OPERATIONAL - Live revenue-generating platform with active subscriptions and growing user base.