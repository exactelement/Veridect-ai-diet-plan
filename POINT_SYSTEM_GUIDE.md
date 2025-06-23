# Veridect Point System Guide

## Overview

Veridect implements a dual point tracking system designed to balance competitive weekly challenges with long-term progress tracking.

## Point System Architecture

### Dual Tracking System

1. **Lifetime Points (totalPoints)**
   - Never reset
   - Accumulate forever
   - Used for level progression
   - Calculation: 1000 points per level

2. **Weekly Points (weeklyPoints)**
   - Reset every Monday at 00:00 Madrid time
   - Used for leaderboard competition
   - Used for weekly progress tracking

### Point Values

- **YES verdict**: 10 points
- **OK verdict**: 5 points  
- **NO verdict**: 2 points

### Point Sources

1. **Food Logging**: Points awarded when user clicks "Yum" button after analysis
2. **Bonus Points**: Future implementation for challenges, streaks, achievements
3. **Referral Bonuses**: Future implementation
4. **Subscription Perks**: Future implementation

## Weekly Challenge System

### Participation

- Users can opt in/out via Profile settings
- Setting: "Weekly Challenge Participation" → "Include me in leaderboard competitions"
- Toggling automatically updates leaderboard visibility

### Weekly Reset Schedule

- **Trigger**: Every Monday at 00:00 Madrid time
- **Resets**: Weekly points, Yes/OK/No counters
- **Preserves**: Lifetime points, food history, user progress

### Leaderboard Features

- Real-time ranking based on weekly points
- Yes/OK/No food verdict counters
- Optional participation (privacy-controlled)
- Automatic refresh when settings change

## Database Schema

### Users Table
```sql
total_points: integer -- Lifetime points (never reset)
current_level: integer -- Calculated from total_points
current_streak: integer -- Days without "NO" foods
privacy_settings: jsonb -- Includes participateInWeeklyChallenge
```

### Weekly Scores Table
```sql
weekly_points: integer -- Points earned this week
yes_count: integer -- YES foods logged this week
ok_count: integer -- OK foods logged this week  
no_count: integer -- NO foods logged this week
week_start: timestamp -- Monday 00:00 Madrid time
rank: integer -- Current leaderboard position
```

### Food Logs Table
```sql
is_logged: boolean -- True when user clicks "Yum"
verdict: string -- YES/OK/NO
calories: integer -- Nutritional data
created_at: timestamp -- For daily/weekly filtering
```

## Implementation Details

### Daily Reset System
- Runs at 00:00 Madrid time
- No data deletion - uses date filtering
- getTodaysFoodLogs() filters by current date

### Weekly Reset System  
- Runs Monday 00:00 Madrid time
- Deletes all weekly_scores entries
- Preserves all food_logs for history

### Level Calculation
```javascript
const currentLevel = Math.floor(totalLifetimePoints / 1000) + 1;
const pointsToNextLevel = (currentLevel * 1000) - totalLifetimePoints;
const levelProgress = ((totalLifetimePoints % 1000) / 1000) * 100;
```

## User Experience

### Homepage Display
- **Total Score**: Shows weekly points (resets Monday)
- **Level Progress**: Shows lifetime points and level
- **Today's Stats**: Yes/OK/No counts from today only

### Leaderboard Display
- **Weekly Rankings**: Based on weekly points
- **Personal Score**: Current week performance
- **Food Counters**: Yes/OK/No from logged foods

### Profile Settings
- **Show Food Statistics**: Display Yes/OK/No counts
- **Weekly Challenge Participation**: Include in leaderboard
- **Show Calorie Counter**: Display calorie tracking

## Privacy Controls

Users can control their participation and data visibility:

1. **Weekly Challenge Participation**: Opt out of leaderboards
2. **Show Food Statistics**: Hide/show food verdict counts  
3. **Show Calorie Counter**: Hide/show calorie tracking

Changes immediately refresh the UI and leaderboard display.