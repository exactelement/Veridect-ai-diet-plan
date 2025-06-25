# Veridect Onboarding Flow Documentation

## Overview
Complete sequential onboarding process ensuring all users complete GDPR consent before accessing main application features.

## Flow Architecture

### App Routing Logic (App.tsx)
```
- NOT authenticated → Landing page routes (/, /login, /privacy, etc.)
- Authenticated + onboardingCompleted = true → Main app routes
- Authenticated + onboardingCompleted = false → Onboarding (catch-all route *)
```

### Step-by-Step Process

#### Step 1: Calorie Goals
- User sets daily calorie goal (800-5000, default 2000)
- Click "Continue" → Next step

#### Step 2: Health Goals
- Multiple selection: Weight loss, muscle building, heart health, diabetes management, etc.
- Click "Continue" → Next step

#### Step 3: Dietary Preferences & Allergies
- **Dietary Preferences**: Vegetarian, Vegan, Keto, Paleo, Mediterranean, Low-carb, Low-fat, Gluten-free, Dairy-free
- **Allergies**: Nuts, Shellfish, Dairy, Eggs, Soy, Gluten, Fish
- Click "Continue" → Triggers `updateProfileMutation` → Step 4

#### Step 4: Plan Selection
Two paths diverge:

**Path A: Free Plan**
1. User clicks "Continue with Free"
2. `handleSubscriptionChoice('free')` executes:
   - Sets `localStorage.setItem('pending-free-tier', 'true')`
   - Calls `completeOnboardingMutation.mutate()`
3. Database: `onboardingCompleted = true`
4. User stays on onboarding page
5. GDPR banner appears
6. After GDPR completion → Redirects to `/food-analysis`

**Path B: Pro Plan Upgrade**
1. User clicks "Upgrade to Pro"
2. `handleSubscriptionChoice('pro')` executes:
   - Sets `pendingSubscriptionUpgrade = true`
   - Sets `localStorage.setItem('pending-pro-upgrade', 'true')`
   - Calls `completeOnboardingMutation.mutate()`
3. Database: `onboardingCompleted = true`
4. User stays on onboarding page
5. GDPR banner appears
6. After GDPR completion → Redirects to `/subscription`

## GDPR Banner Integration

### Display Logic
Shows when:
- `user.onboardingCompleted = true` ✓
- `user.has_seen_privacy_banner = false` ✓

### Completion Logic
```javascript
const pendingProUpgrade = localStorage.getItem('pending-pro-upgrade');
const pendingFreeTier = localStorage.getItem('pending-free-tier');

if (pendingProUpgrade === 'true') {
  localStorage.removeItem('pending-pro-upgrade');
  window.location.href = '/subscription';
} else if (pendingFreeTier === 'true') {
  localStorage.removeItem('pending-free-tier');
  window.location.href = '/food-analysis';
}
```

## localStorage Flags

### pending-pro-upgrade
- **Set**: When user chooses Pro plan during onboarding
- **Purpose**: Redirect to subscription page after GDPR completion
- **Cleanup**: Removed after successful redirect

### pending-free-tier
- **Set**: When user chooses free plan during onboarding
- **Purpose**: Redirect to food analysis page after GDPR completion
- **Cleanup**: Removed after successful redirect

## Database Updates

### Onboarding Completion
```sql
UPDATE users SET 
  onboarding_completed = true,
  calorie_goal = ?,
  dietary_preferences = ?,
  health_goals = ?,
  allergies = ?
WHERE id = ?
```

### GDPR Consent
```sql
UPDATE users SET 
  has_seen_privacy_banner = true,
  gdpr_consent = ?
WHERE id = ?
```

## Final User States

### Free Tier Users
- Access to 5 analyses per day
- Basic nutritional information
- Simple yes/no verdicts
- No leaderboard/community access

### Pro Tier Users (After Payment)
- Unlimited analyses
- Food logging & progress tracking
- Challenges & leaderboard access
- Personalized AI analysis

### Pro Tier Users (Payment Failed)
- Reverts to free tier access
- Encouraging messages to retry payment
- Full feature access restored upon successful payment

## Error Handling

### Onboarding Mutation Failure
- Shows error toast with specific message
- User remains on current step
- Can retry the action

### Payment Failure
- Redirects to food analysis with failure message
- User maintains free tier access
- Option to retry subscription upgrade

## Technical Implementation

### Key Files
- `client/src/pages/onboarding.tsx` - Main onboarding component
- `client/src/components/gdpr-banner.tsx` - GDPR consent banner
- `client/src/App.tsx` - Routing logic
- `server/storage.ts` - Database operations
- `shared/schema.ts` - Data models

### Mutations
- `updateProfileMutation` - Saves user preferences
- `completeOnboardingMutation` - Marks onboarding complete
- `gdprConsentMutation` - Saves privacy preferences

### State Management
- TanStack Query for server state
- localStorage for navigation coordination
- React state for UI interactions