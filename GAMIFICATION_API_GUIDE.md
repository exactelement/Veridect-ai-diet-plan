# Veridect Gamification API Guide

## Overview

This guide documents the gamification system APIs for Veridect, including point tracking, leaderboards, and user progression.

## Point System Endpoints

### Award Points for Food Logging
```http
POST /api/food-logs
Content-Type: application/json
Authorization: Session-based

{
  "foodName": "Cheeseburger",
  "verdict": "OK",
  "calories": 600,
  "protein": 25,
  "confidence": 85
}
```

**Response:**
```json
{
  "success": true,
  "log": {
    "id": 47,
    "userId": "user_123",
    "foodName": "Cheeseburger",
    "verdict": "OK",
    "calories": 600,
    "isLogged": true,
    "createdAt": "2025-06-23T22:44:50.137Z"
  }
}
```

**Point Values:**
- YES verdict: 10 points
- OK verdict: 5 points
- NO verdict: 2 points

## Leaderboard Endpoints

### Get Weekly Leaderboard
```http
GET /api/leaderboard/weekly
Authorization: Session-based
```

**Response:**
```json
[
  {
    "id": 3,
    "userId": "user_123",
    "weekStart": "2025-06-23T00:00:00.000Z",
    "yesCount": 0,
    "okCount": 2,
    "noCount": 0,
    "weeklyPoints": 10,
    "rank": 1,
    "firstName": "John",
    "lastName": "D"
  }
]
```

### Get User's Weekly Score
```http
GET /api/leaderboard/my-score
Authorization: Session-based
```

**Response:**
```json
{
  "id": 3,
  "userId": "user_123",
  "weekStart": "2025-06-23T00:00:00.000Z",
  "yesCount": 0,
  "okCount": 2,
  "noCount": 0,
  "weeklyPoints": 10,
  "rank": 1
}
```

**Returns:** `null` if user has opted out of weekly challenges

## User Profile Endpoints

### Update Privacy Settings
```http
PUT /api/user/profile
Content-Type: application/json
Authorization: Session-based

{
  "privacySettings": {
    "participateInWeeklyChallenge": true,
    "showFoodStats": true,
    "showCalorieCounter": true
  }
}
```

### Get User Statistics
```http
GET /api/auth/user
Authorization: Session-based
```

**Response:**
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "totalPoints": 150,
  "currentLevel": 1,
  "currentStreak": 3,
  "privacySettings": {
    "participateInWeeklyChallenge": true,
    "showFoodStats": true,
    "showCalorieCounter": true
  }
}
```

## Food Tracking Endpoints

### Get Today's Food Logs
```http
GET /api/food/logs/today
Authorization: Session-based
```

**Response:**
```json
[
  {
    "id": 47,
    "userId": "user_123",
    "foodName": "Cheeseburger",
    "verdict": "OK",
    "calories": 600,
    "protein": 25,
    "isLogged": true,
    "createdAt": "2025-06-23T22:44:50.137Z"
  }
]
```

### Get Food History
```http
GET /api/food/logs?limit=50&offset=0
Authorization: Session-based
```

**Query Parameters:**
- `limit`: Number of logs to return (default: 50)
- `offset`: Number of logs to skip (default: 0)

## Weekly Reset System

### Reset Schedule
- **Trigger**: Every Monday at 00:00 Madrid time
- **Resets**: Weekly points, Yes/OK/No counters, leaderboard rankings
- **Preserves**: Lifetime points, food history, user profiles

### Weekly Challenge Participation
Users can opt out of weekly challenges via privacy settings:

```javascript
// User opts out - removed from leaderboard
{
  "privacySettings": {
    "participateInWeeklyChallenge": false
  }
}

// API responses when opted out:
// GET /api/leaderboard/my-score → null
// GET /api/leaderboard/weekly → user not included
```

## Error Handling

### Common Error Responses

**401 Unauthorized:**
```json
{
  "message": "Unauthorized"
}
```

**400 Bad Request:**
```json
{
  "message": "Invalid verdict. Must be YES, OK, or NO"
}
```

**500 Internal Server Error:**
```json
{
  "message": "Failed to update weekly score"
}
```

## Mobile Integration Tips

### Real-time Updates
- Cache invalidation triggers when privacy settings change
- Leaderboard refreshes automatically on participation toggle
- Point updates reflected immediately after food logging

### Offline Support
- Cache food logs locally when offline
- Sync when connection restored
- Display cached leaderboard data with offline indicator

### Performance Optimization
- Paginate food history for large datasets
- Cache user profile data locally
- Batch food log uploads when possible

## Privacy Controls

### Available Settings
1. **Weekly Challenge Participation**: Include/exclude from leaderboards
2. **Show Food Statistics**: Display Yes/OK/No counts
3. **Show Calorie Counter**: Display calorie tracking

### Implementation Notes
- Settings changes trigger immediate UI updates
- Leaderboard visibility controlled by participation setting
- All privacy settings respect user preferences