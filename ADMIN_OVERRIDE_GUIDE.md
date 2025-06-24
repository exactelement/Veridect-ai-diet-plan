# Admin Override System - Veridect

## Overview
As the platform administrator, you have special access to all Pro and Advanced features without requiring a paid subscription. This allows you to test and demonstrate all functionality.

## Admin Email Addresses
The following email addresses have admin privileges:
- `10xr.co@gmail.com`
- `yesnolifestyleapp@gmail.com` 
- `quantaalgo@gmail.com`

## Admin Privileges

### Unlimited Daily Analyses
- Free tier users are limited to 5 daily analyses
- Admin emails get unlimited analyses regardless of subscription tier

### Full Feature Access
Admin emails can access all Pro/Advanced features:
- ✅ Unlimited food analyses
- ✅ Food logging and history
- ✅ Leaderboard access
- ✅ Progress tracking
- ✅ Detailed nutrition information
- ✅ Weekly progress reports
- ✅ Challenge system and bonus points
- ✅ Advanced AI features
- ✅ Export functionality

### How It Works
The system checks your email address before applying subscription restrictions:

1. **Backend Override:** All API endpoints check for admin emails before enforcing limits
2. **Frontend Override:** UI components automatically show Pro features for admin emails
3. **Transparent Access:** No special UI indicators - you simply get full access

## Testing with Admin Account
1. Sign in with any of the admin email addresses
2. All Pro features will be automatically available
3. No subscription upgrade required
4. No payment processing needed

## Implementation Details
- Admin emails are hardcoded in subscription limit functions
- Override applies to both daily usage limits and feature access
- Works across all authentication providers (Google, Apple, Email)
- Maintains audit trail in logs for admin actions

## Security
- Admin emails are server-side validated
- Cannot be bypassed by frontend manipulation  
- Admin privileges are not exposed in API responses
- Regular security audits include admin access reviews

This system allows you to fully test and demonstrate Veridect's capabilities while maintaining proper subscription enforcement for regular users.