# Veridect Setup Guide

## Prerequisites

- Node.js 20+
- PostgreSQL database (Replit provides this)
- Replit account for authentication and hosting

## Required Environment Variables

### Database Configuration
```
DATABASE_URL=your_postgresql_connection_string
PGDATABASE=your_database_name
PGHOST=your_database_host
PGPASSWORD=your_database_password
PGPORT=your_database_port
PGUSER=your_database_user
```

### Authentication
```
SESSION_SECRET=your_session_secret_key
REPL_ID=your_replit_app_id
REPLIT_DOMAINS=your_replit_domain.replit.dev
ISSUER_URL=https://replit.com/oidc
```

### AI Integration
```
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
```

### Payment Processing (Optional)
```
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_PRICE_ID=your_stripe_price_id
```

## Installation Steps

1. **Clone Repository**
   ```bash
   git clone <repository_url>
   cd veridect
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   ```bash
   # Push schema to database
   npm run db:push
   
   # Generate migrations (if needed)
   npm run db:generate
   ```

4. **Environment Configuration**
   - Add environment variables to Replit Secrets
   - Ensure all required keys are present

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## Project Structure

```
veridect/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── ui/         # Shadcn/UI components
│   │   │   └── google-translate.tsx  # Translation system
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and configurations
├── server/                 # Backend Express application
│   ├── services/           # Business logic and AI integration
│   ├── routes.ts          # API endpoints
│   └── storage.ts         # Database operations
├── shared/                 # Shared TypeScript types and schemas
│   └── schema.ts          # Drizzle database schema
└── public/                # Static assets
```

## Key Features Configuration

### Translation System

The translation system is automatically enabled and requires no additional configuration. It uses the free MyMemory Translation API.

**Supported Languages:**
- English (default)
- Spanish, French, German, Italian
- Portuguese, Russian, Japanese, Korean
- Chinese, Arabic, Hindi, Dutch
- Polish, Swedish, Danish, Norwegian
- Finnish, Turkish, Greek

### Food Analysis

**Google Gemini Integration:**
1. Obtain API key from Google AI Studio
2. Add `GOOGLE_GEMINI_API_KEY` to environment
3. System automatically handles image and text analysis

**Analysis Methods:**
- Camera capture (real-time)
- Image upload from device
- Text-based food description

### Gamification System

**Point Calculation:**
- YES verdict: 10 points
- OK verdict: 5 points  
- NO verdict: 2 points
- Bonus achievements: Variable points

**Level Progression:**
- 1000 points per level
- Weekly point resets every Monday (Madrid timezone)
- Lifetime points tracked separately

### Subscription Management

**Stripe Configuration:**
1. Create Stripe account and get API keys
2. Set up products and pricing in Stripe Dashboard
3. Configure webhook endpoints for subscription events

**Pricing Tiers:**
- Free: €0 (5 analyses/day)
- Pro: €19.99/month (unlimited analyses + advanced features)
- Medical: €49.99/month (professional nutrition guidance)

## Development Workflow

### Database Changes

1. **Modify Schema**
   ```typescript
   // Edit shared/schema.ts
   export const newTable = pgTable("new_table", {
     id: serial("id").primaryKey(),
     // ... fields
   });
   ```

2. **Push Changes**
   ```bash
   npm run db:push
   ```

3. **Update Storage Interface**
   ```typescript
   // Edit server/storage.ts
   interface IStorage {
     // Add new methods
   }
   ```

### Adding New Pages

1. **Create Page Component**
   ```typescript
   // client/src/pages/new-page.tsx
   export default function NewPage() {
     return <div>New Page Content</div>;
   }
   ```

2. **Add Route**
   ```typescript
   // client/src/App.tsx
   import NewPage from "@/pages/new-page";
   
   // Add to Switch component
   <Route path="/new-page" component={NewPage} />
   ```

3. **Update Navigation** (if needed)
   ```typescript
   // client/src/components/navigation.tsx
   ```

### API Endpoints

1. **Add Route Handler**
   ```typescript
   // server/routes.ts
   app.get('/api/new-endpoint', async (req, res) => {
     // Implementation
   });
   ```

2. **Add Storage Method**
   ```typescript
   // server/storage.ts
   async newMethod() {
     // Database operations
   }
   ```

## Testing

### Manual Testing

1. **Authentication Flow**
   - Test login/logout functionality
   - Verify session persistence
   - Check user profile updates

2. **Food Analysis**
   - Upload various food images
   - Test camera functionality
   - Verify verdict accuracy

3. **Translation System**
   - Test language switching
   - Verify persistence across pages
   - Check text rendering in different languages

4. **Gamification**
   - Test point accumulation
   - Verify level progression
   - Check leaderboard updates

### Performance Testing

1. **Translation Performance**
   - Monitor API response times
   - Check localStorage usage
   - Test with large pages

2. **Database Performance**
   - Monitor query execution times
   - Check connection pooling
   - Verify caching effectiveness

## Deployment

### Replit Deployment

1. **Environment Setup**
   - Ensure all secrets are configured
   - Verify database connection
   - Test external API access

2. **Build Process**
   ```bash
   npm run build
   ```

3. **Production Deployment**
   - Use Replit Deployments feature
   - Configure custom domain (optional)
   - Enable autoscaling

### Monitoring

1. **Application Logs**
   - Monitor server console output
   - Check error rates and patterns
   - Track API usage statistics

2. **Database Monitoring**
   - Monitor connection counts
   - Check query performance
   - Track storage usage

3. **External Services**
   - Monitor Gemini AI API usage
   - Track translation API calls
   - Verify Stripe webhook delivery

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify DATABASE_URL format
   - Check network connectivity
   - Ensure database is running

2. **Authentication Issues**
   - Verify REPL_ID and domain configuration
   - Check session secret validity
   - Ensure HTTPS in production

3. **Translation Not Working**
   - Check browser localStorage support
   - Verify MyMemory API accessibility
   - Review browser console errors

4. **Build Failures**
   - Clear node_modules and reinstall
   - Check TypeScript compilation errors
   - Verify all imports are correct

### Debug Mode

Enable debug logging:
```javascript
// In browser console
localStorage.setItem('debug', 'veridect:*');
window.veridectDebugTranslation = true;
```

## Support and Maintenance

### Regular Tasks

1. **Weekly**
   - Review error logs
   - Monitor API usage
   - Check user feedback

2. **Monthly**
   - Update dependencies
   - Review translation cache
   - Analyze performance metrics

3. **Quarterly**
   - Security audit
   - API rate limit review
   - Feature usage analysis

### Contact Information

- **Technical Issues**: Check logs and error messages
- **API Limitations**: Monitor usage quotas
- **Feature Requests**: Document in project issues

---

**Last Updated**: June 23, 2025  
**Version**: 1.0  
**Next Review**: Monthly maintenance cycle