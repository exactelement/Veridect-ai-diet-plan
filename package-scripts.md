# Package Scripts Reference

## Development Scripts

```bash
# Start development server (frontend + backend)
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check
```

## Database Scripts

```bash
# Push schema changes to database
npm run db:push

# Open database management studio
npm run db:studio

# Generate database migrations (if needed)
npm run db:generate
```

## Available Scripts Breakdown

### `npm run dev`
- Starts Express server on port 5000
- Serves React frontend with Vite HMR
- Enables hot reloading for both client and server
- Automatically restarts on file changes

### `npm run build`
- Builds optimized production bundle
- Compiles TypeScript to JavaScript
- Optimizes assets for deployment
- Creates dist/ folder with deployable files

### `npm run db:push`
- Syncs database schema with your code
- Creates/updates tables automatically
- Safe to run multiple times
- Required after schema changes

### `npm run db:studio`
- Opens Drizzle Studio web interface
- Visual database management
- Run queries and inspect data
- Available at http://localhost:4983

## Project Dependencies

### Core Dependencies
- `react` - Frontend framework
- `express` - Backend server
- `drizzle-orm` - Database ORM
- `@google/generative-ai` - AI analysis
- `stripe` - Payment processing
- `@sendgrid/mail` - Email services

### Development Dependencies
- `typescript` - Type safety
- `vite` - Frontend build tool
- `drizzle-kit` - Database tools
- `tsx` - TypeScript execution
- `tailwindcss` - Styling framework

## Environment Setup Check

Run this to verify your setup:

```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version

# Install dependencies
npm install

# Verify database connection
npm run db:push

# Start development server
npm run dev
```

## Production Build Process

```bash
# 1. Install dependencies
npm ci

# 2. Build application
npm run build

# 3. Start production server
npm start
```

The built application will be optimized and ready for deployment.