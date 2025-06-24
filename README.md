# Veridect - AI-Powered Food Analysis Platform

A modern health-focused web application that provides instant AI-powered food analysis with simple "Yes", "No", or "OK" verdicts. Features comprehensive gamification including weekly leaderboards, level progression, and dual point tracking system. Built with React, Express.js, and Google Gemini AI.

## Key Features

- **Instant Food Analysis**: Camera, upload, or text-based food analysis with beverage support
- **Personalized AI Verdicts**: AI considers health goals, dietary preferences, allergies, and subscription tier
- **Witty AI Responses**: Dynamic, humorous responses for non-food items with creative humor styles
- **Dual Point System**: Lifetime points (never reset) for levels + weekly points (reset Monday) for competition
- **Weekly Leaderboards**: Position rankings (#1, #2, #3) with optional participation, Madrid timezone resets
- **Level Progression**: 1000 points per level using lifetime points accumulation
- **Privacy Controls**: Customizable participation in challenges and data display
- **Multi-Authentication**: Replit Auth with session-based security
- **GDPR Compliance**: Granular privacy consent management
- **Subscription Tiers**: Free, Pro ($19.99), and Medical ($49.99) plans

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment (see SETUP.md for details)
cp .env.example .env
# Edit .env with your database URL and API keys

# 3. Initialize database
npm run db:push

# 4. Start development server
npm run dev
```

Visit `http://localhost:5000` to see your app running.

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
- **Google Gemini AI** for food analysis
- **Stripe** for payment processing
- **SendGrid** for email services

### Authentication
- **Replit Auth** with OpenID Connect
- **Google OAuth** integration
- **Apple Sign-In** support
- **Email/Password** with bcrypt hashing

## Project Structure

```
yesnoapp/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   └── services/      # API service layers
├── server/                # Express.js backend
│   ├── services/          # Business logic services
│   ├── db.ts             # Database connection
│   ├── routes.ts         # API route definitions
│   └── storage.ts        # Data access layer
├── shared/               # Shared TypeScript schemas
│   └── schema.ts         # Database and validation schemas
└── package.json         # Dependencies and scripts
```

## Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `GOOGLE_GEMINI_API_KEY` - For AI food analysis
- `SESSION_SECRET` - Random string for session security

Optional:
- `STRIPE_SECRET_KEY` / `VITE_STRIPE_PUBLIC_KEY` - Payment processing
- `SENDGRID_API_KEY` - Email services
- `VITE_GA_MEASUREMENT_ID` - Google Analytics

See `SETUP.md` for detailed configuration instructions.

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run db:push      # Sync database schema
npm run db:studio    # Open database management UI
npm run type-check   # TypeScript type checking
```

## Core User Flow

1. **Authentication**: Users sign in via multiple providers or create email accounts
2. **Onboarding**: Set health goals, dietary preferences, and allergies
3. **Food Analysis**: Analyze food via camera, upload, or text description
4. **AI Verdict**: Receive personalized YES/NO/OK verdict with explanation
5. **Action Choice**: Click "Yum" to log food and earn points, or "Nah" to discard
6. **Progress Tracking**: View weekly scores and compete on leaderboards

## AI Personalization

The AI analysis considers:
- **Health Goals**: Weight loss, muscle gain, general health
- **Dietary Preferences**: Vegan, vegetarian, keto, paleo, etc.
- **Allergies**: Automatic safety warnings for allergens
- **Subscription Tier**: Casual explanations vs detailed scientific analysis

## Deployment

### Replit (Recommended)
1. Import project to Replit
2. Add environment variables in Secrets tab
3. Run `npm run dev`
4. Deploy using Replit's one-click deployment

### Other Platforms
1. Build: `npm run build`
2. Set environment variables
3. Deploy built application

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software. All rights reserved.

## Support

For setup issues, see `SETUP.md` or check the console for error messages. Ensure all environment variables are properly configured and the database is accessible.