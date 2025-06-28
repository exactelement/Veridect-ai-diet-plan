# Complete API Endpoints Guide for Veridect

This comprehensive guide documents every API endpoint needed to reproduce the Veridect backend with 100% feature parity.

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [User Management Endpoints](#user-management-endpoints)
3. [Food Analysis Endpoints](#food-analysis-endpoints)
4. [Gamification Endpoints](#gamification-endpoints)
5. [Subscription Endpoints](#subscription-endpoints)
6. [Admin Endpoints](#admin-endpoints)
7. [Error Handling](#error-handling)
8. [Request/Response Examples](#requestresponse-examples)

## Authentication Endpoints

### POST /api/auth/login
**Purpose**: Email/password authentication
**Authentication**: None required
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "userpassword123"
}
```
**Response**:
```json
{
  "success": true,
  "user": {
    "id": "email_1750754837024_659gmnhb1",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isOnboardingComplete": true,
    "subscriptionTier": "pro",
    "totalPoints": 1250,
    "level": 2
  }
}
```

### POST /api/auth/register
**Purpose**: Create new user account
**Authentication**: None required
**Request Body**:
```json
{
  "email": "newuser@example.com",
  "password": "securepassword123",
  "firstName": "Jane",
  "lastName": "Smith"
}
```
**Response**:
```json
{
  "success": true,
  "user": {
    "id": "email_1750756000000_newuser",
    "email": "newuser@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "isOnboardingComplete": false,
    "subscriptionTier": "free",
    "totalPoints": 0,
    "level": 1
  }
}
```

### GET /api/auth/user
**Purpose**: Get current authenticated user
**Authentication**: Required (session-based)
**Response**:
```json
{
  "id": "email_1750754837024_659gmnhb1",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "profileImageUrl": null,
  "authProvider": "email",
  "isOnboardingComplete": true,
  "age": 30,
  "gender": "male",
  "activityLevel": "moderate",
  "healthGoals": ["weight_loss", "muscle_gain"],
  "dietaryPreferences": ["vegetarian"],
  "allergies": [],
  "calorieGoal": 2000,
  "totalPoints": 1250,
  "level": 2,
  "currentStreak": 5,
  "longestStreak": 12,
  "badgesEarned": 8,
  "subscriptionTier": "pro",
  "subscriptionStatus": "active",
  "showFoodStatistics": true,
  "participateInWeeklyChallenge": true,
  "hasSeenGdprBanner": true,
  "hasAcceptedTerms": true,
  "createdAt": "2025-06-24T10:30:00.000Z",
  "updatedAt": "2025-06-28T15:45:00.000Z"
}
```

### GET /api/logout
**Purpose**: End user session
**Authentication**: Required
**Response**: Redirects to OpenID Connect logout URL

## User Management Endpoints

### PUT /api/user/profile
**Purpose**: Update user profile information
**Authentication**: Required
**Request Body**:
```json
{
  "firstName": "Updated Name",
  "age": 25,
  "healthGoals": ["weight_loss", "energy_boost"],
  "dietaryPreferences": ["vegan"],
  "allergies": ["nuts"],
  "calorieGoal": 1800,
  "showFoodStatistics": true,
  "participateInWeeklyChallenge": false
}
```
**Response**:
```json
{
  "success": true,
  "user": {
    // Updated user object
  }
}
```

### POST /api/user/onboarding
**Purpose**: Complete user onboarding process
**Authentication**: Required
**Request Body**:
```json
{
  "age": 28,
  "gender": "female",
  "activityLevel": "active",
  "healthGoals": ["weight_loss", "muscle_gain"],
  "dietaryPreferences": ["pescatarian"],
  "allergies": ["shellfish"]
}
```
**Response**:
```json
{
  "success": true,
  "user": {
    // Updated user with isOnboardingComplete: true
  }
}
```

### POST /api/user/gdpr-consent
**Purpose**: Record GDPR consent choices
**Authentication**: Required
**Request Body**:
```json
{
  "consent": {
    "analytics": true,
    "marketing": false,
    "aiTraining": true,
    "necessary": true
  }
}
```
**Response**:
```json
{
  "success": true,
  "message": "GDPR consent recorded successfully"
}
```

### POST /api/user/accept-terms
**Purpose**: Record terms of service acceptance
**Authentication**: Required
**Request Body**: Empty
**Response**:
```json
{
  "success": true,
  "message": "Terms accepted successfully"
}
```

## Food Analysis Endpoints

### POST /api/analyze-food
**Purpose**: Analyze food using AI (Google Gemini)
**Authentication**: Required
**Rate Limit**: Free tier: 5/day, Pro/Advanced: unlimited
**Request Body** (Image Analysis):
```json
{
  "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA...",
  "foodName": "Optional description"
}
```
**Request Body** (Text Analysis):
```json
{
  "foodName": "Grilled chicken breast with quinoa and vegetables"
}
```
**Response**:
```json
{
  "id": "analysis_1750760000000_xyz",
  "foodName": "Grilled Chicken Breast with Quinoa",
  "verdict": "YES",
  "explanation": "Excellent choice! This meal provides high-quality protein from the chicken, complete amino acids from quinoa, and essential vitamins from the vegetables. Perfect for muscle maintenance and sustained energy.",
  "confidence": 92,
  "calories": 450,
  "protein": 35,
  "carbohydrates": 25,
  "fat": 12,
  "fiber": 6,
  "sugar": 8,
  "sodium": 380,
  "portion": "1 serving (250g)",
  "analysisMethod": "ai",
  "alternatives": ["salmon with brown rice", "turkey with sweet potato"],
  "isLogged": false,
  "analyzedAt": "2025-06-28T16:00:00.000Z"
}
```

### POST /api/log-food
**Purpose**: Log analyzed food to user's food diary
**Authentication**: Required
**Request Body**:
```json
{
  "analysisId": "analysis_1750760000000_xyz",
  "isLogged": true
}
```
**Response**:
```json
{
  "success": true,
  "pointsAwarded": 10,
  "message": "Food logged successfully! +10 points awarded.",
  "updatedUser": {
    "totalPoints": 1260,
    "currentStreak": 6
  }
}
```

### GET /api/food-logs
**Purpose**: Get user's food log history (paginated)
**Authentication**: Required
**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response**:
```json
{
  "foodLogs": [
    {
      "id": 198,
      "userId": "email_1750754837024_659gmnhb1",
      "foodName": "Grilled Chicken Breast",
      "verdict": "YES",
      "explanation": "Excellent protein source...",
      "calories": 300,
      "protein": 25,
      "isLogged": true,
      "loggedAt": "2025-06-28T15:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

### GET /api/food-logs/today
**Purpose**: Get today's logged foods (Madrid timezone)
**Authentication**: Required
**Response**:
```json
[
  {
    "id": 198,
    "foodName": "Grilled Chicken Breast",
    "verdict": "YES",
    "calories": 300,
    "loggedAt": "2025-06-28T15:30:00.000Z"
  }
]
```

### GET /api/food/analyzed/today
**Purpose**: Get today's analyzed foods count (for usage limits)
**Authentication**: Required
**Response**:
```json
[
  {
    "id": 198,
    "foodName": "Grilled Chicken Breast",
    "analyzedAt": "2025-06-28T15:30:00.000Z"
  },
  {
    "id": 199,
    "foodName": "Greek Yogurt",
    "analyzedAt": "2025-06-28T16:15:00.000Z"
  }
]
```

### GET /api/food/yes-streak
**Purpose**: Get user's consecutive YES food streak
**Authentication**: Required
**Response**:
```json
{
  "consecutiveYesStreak": 5
}
```

## Gamification Endpoints

### GET /api/leaderboard/weekly
**Purpose**: Get weekly leaderboard rankings
**Authentication**: Required
**Tier Restriction**: Pro/Advanced only
**Response**:
```json
[
  {
    "id": 17,
    "userId": "email_1750732810584_user1",
    "weekStart": "2025-06-23",
    "weeklyPoints": 180,
    "rank": 1,
    "yesCount": 12,
    "okCount": 3,
    "noCount": 1,
    "user": {
      "firstName": "Alice",
      "lastName": "Johnson",
      "profileImageUrl": null
    }
  },
  {
    "id": 18,
    "userId": "email_1750754837024_659gmnhb1",
    "weekStart": "2025-06-23",
    "weeklyPoints": 95,
    "rank": 2,
    "yesCount": 7,
    "okCount": 4,
    "noCount": 2,
    "user": {
      "firstName": "John",
      "lastName": "Doe",
      "profileImageUrl": null
    }
  }
]
```

### GET /api/leaderboard/my-score
**Purpose**: Get current user's weekly score and rank
**Authentication**: Required
**Tier Restriction**: Pro/Advanced only
**Response**:
```json
{
  "id": 18,
  "userId": "email_1750754837024_659gmnhb1",
  "weekStart": "2025-06-23",
  "weeklyPoints": 95,
  "rank": 2,
  "yesCount": 7,
  "okCount": 4,
  "noCount": 2
}
```

### GET /api/challenges/completed
**Purpose**: Get user's completed challenges
**Authentication**: Required
**Response**:
```json
[
  {
    "id": 1,
    "userId": "email_1750754837024_659gmnhb1",
    "bonusType": "first_analysis",
    "pointsAwarded": 25,
    "dateAwarded": "2025-06-28"
  },
  {
    "id": 2,
    "userId": "email_1750754837024_659gmnhb1",
    "bonusType": "5_analyses",
    "pointsAwarded": 25,
    "dateAwarded": "2025-06-28"
  }
]
```

### GET /api/user/progress
**Purpose**: Get comprehensive user progress data
**Authentication**: Required
**Response**:
```json
{
  "user": {
    "totalPoints": 1250,
    "level": 2,
    "currentStreak": 5,
    "longestStreak": 12,
    "badgesEarned": 8
  },
  "weeklyScore": {
    "weeklyPoints": 95,
    "rank": 2
  },
  "todaysStats": {
    "analysesCount": 3,
    "loggedCount": 2,
    "caloriesConsumed": 850
  },
  "milestones": {
    "healthExpert": false,
    "healthMaster": false,
    "healthLegend": false
  }
}
```

## Subscription Endpoints

### POST /api/get-or-create-subscription
**Purpose**: Create or retrieve Stripe subscription
**Authentication**: Required
**Request Body**: Empty
**Response** (New Subscription):
```json
{
  "subscriptionId": "sub_1234567890",
  "clientSecret": "pi_1234567890_secret_xyz",
  "status": "incomplete"
}
```
**Response** (Existing Active Subscription):
```json
{
  "subscriptionId": "sub_1234567890",
  "status": "active"
}
```

### GET /api/subscription/status
**Purpose**: Get current subscription status
**Authentication**: Required
**Response**:
```json
{
  "tier": "pro",
  "status": "active",
  "currentPeriodEnd": "2026-06-28T00:00:00.000Z",
  "cancelAtPeriodEnd": false,
  "subscriptionId": "sub_1234567890"
}
```

### POST /api/stripe/webhook
**Purpose**: Handle Stripe webhook events
**Authentication**: Stripe signature verification
**Headers**: `stripe-signature`
**Request Body**: Raw Stripe webhook payload
**Handled Events**:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## Admin Endpoints

### GET /api/admin/security-metrics
**Purpose**: Get security and system metrics
**Authentication**: Admin only
**Response**:
```json
{
  "users": {
    "total": 9,
    "active": 7,
    "gdprCompliant": 8
  },
  "subscriptions": {
    "free": 5,
    "pro": 3,
    "advanced": 1
  },
  "security": {
    "failedLogins": 2,
    "suspiciousActivity": 0,
    "dataBreaches": 0
  },
  "usage": {
    "dailyAnalyses": 45,
    "monthlyRevenue": 36
  }
}
```

### GET /api/admin/email-preferences
**Purpose**: Export user email preferences
**Authentication**: Admin only
**Response**:
```json
[
  {
    "id": "email_1750754837024_659gmnhb1",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "gdprConsent": {
      "analytics": true,
      "marketing": false
    },
    "hasSeenPrivacyBanner": true,
    "createdAt": "2025-06-24T10:30:00.000Z"
  }
]
```

### GET /api/users/count
**Purpose**: Get total user count
**Authentication**: None required
**Response**:
```json
{
  "count": 9
}
```

## Error Handling

### Standard Error Response Format
```json
{
  "error": "Error message description",
  "code": "ERROR_CODE",
  "details": {
    // Additional error context
  }
}
```

### Common HTTP Status Codes

**400 Bad Request**:
```json
{
  "error": "Invalid request data",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": "email",
    "message": "Invalid email format"
  }
}
```

**401 Unauthorized**:
```json
{
  "message": "Unauthorized"
}
```

**403 Forbidden**:
```json
{
  "error": "Access denied",
  "code": "INSUFFICIENT_PERMISSIONS",
  "details": {
    "requiredTier": "pro",
    "userTier": "free"
  }
}
```

**409 Conflict**:
```json
{
  "error": "Email already registered",
  "code": "DUPLICATE_EMAIL"
}
```

**429 Too Many Requests**:
```json
{
  "error": "Daily analysis limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "details": {
    "limit": 5,
    "used": 5,
    "resetTime": "2025-06-29T00:00:00.000Z"
  }
}
```

**500 Internal Server Error**:
```json
{
  "error": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

## Request/Response Examples

### Complete Food Analysis Flow

**Step 1: Analyze Food**
```bash
curl -X POST https://veridect-app.replit.app/api/analyze-food \
  -H "Content-Type: application/json" \
  -b "connect.sid=s%3A..." \
  -d '{
    "foodName": "Avocado toast with poached egg"
  }'
```

**Step 2: Log Food**
```bash
curl -X POST https://veridect-app.replit.app/api/log-food \
  -H "Content-Type: application/json" \
  -b "connect.sid=s%3A..." \
  -d '{
    "analysisId": "analysis_1750760000000_xyz",
    "isLogged": true
  }'
```

### Authentication Flow

**Step 1: Login**
```bash
curl -X POST https://veridect-app.replit.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Step 2: Get User Data**
```bash
curl -X GET https://veridect-app.replit.app/api/auth/user \
  -H "Content-Type: application/json" \
  -b "connect.sid=s%3A..."
```

### Subscription Setup

**Step 1: Create Subscription**
```bash
curl -X POST https://veridect-app.replit.app/api/get-or-create-subscription \
  -H "Content-Type: application/json" \
  -b "connect.sid=s%3A..."
```

**Step 2: Complete Payment** (Frontend with Stripe Elements)
```javascript
const {error} = await stripe.confirmPayment({
  elements,
  confirmParams: {
    return_url: window.location.origin + '/subscription-success'
  }
});
```

This comprehensive API documentation provides complete endpoint specifications, request/response formats, authentication requirements, and error handling needed to reproduce the Veridect backend API with 100% functionality.