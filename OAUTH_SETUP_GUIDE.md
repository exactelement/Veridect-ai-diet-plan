# OAuth Setup Guide for Veridect

This guide explains how to configure Google OAuth and Apple Sign-In for Veridect.

## Current Status

- ✅ **Google OAuth**: Frontend and backend implemented, requires API credentials
- ✅ **Apple Sign-In**: Frontend and backend implemented, requires Apple Developer setup
- ✅ **Error Handling**: Proper user messages when credentials are missing
- ✅ **Fallback**: Email/password authentication always available

## Required Environment Variables

### For Google OAuth
```
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### For Apple Sign-In
```
VITE_APPLE_CLIENT_ID=com.veridect.signin
```

## Setup Instructions

### Google OAuth Setup

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/apis/credentials
   - Create a new project or select existing one

2. **Enable Google+ API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Name: "Veridect Web App"

4. **Configure Authorized Redirect URIs**
   ```
   Development: http://localhost:5000/api/auth/google/callback
   Production: https://yourdomain.com/api/auth/google/callback
   ```

5. **Copy Credentials**
   - Copy "Client ID" → Set as `GOOGLE_CLIENT_ID`
   - Copy "Client Secret" → Set as `GOOGLE_CLIENT_SECRET`

### Apple Sign-In Setup

1. **Apple Developer Account Required**
   - Requires paid Apple Developer Program membership ($99/year)
   - Visit: https://developer.apple.com/programs/

2. **Create App ID**
   - Go to "Certificates, Identifiers & Profiles"
   - Create new App ID with "Sign In with Apple" capability

3. **Create Service ID**
   - Create new Services ID (e.g., `com.veridect.signin`)
   - Enable "Sign In with Apple"
   - Configure domains and redirect URLs

4. **Generate Private Key**
   - Create new key with "Sign In with Apple" capability
   - Download the .p8 key file
   - Note the Key ID

5. **Set Environment Variable**
   - Set `VITE_APPLE_CLIENT_ID` to your Service ID

## Testing OAuth Integration

### Google OAuth Test Flow
1. Click "Continue with Google" button
2. Without credentials: Shows "Google Sign-In Not Available" message
3. With credentials: Redirects to Google consent screen
4. After consent: Returns to app (onboarding for new users, dashboard for existing)

### Apple Sign-In Test Flow
1. Click "Continue with Apple" button
2. Without credentials: Shows "Apple Sign-In Not Available" message
3. With credentials: Opens Apple Sign-In popup
4. After sign-in: Creates account or logs in existing user

## Error Messages

The system provides clear feedback when OAuth isn't configured:

- **Google**: "Google authentication requires API credentials. Please use email registration or contact support."
- **Apple**: "Apple authentication requires configuration. Please contact support or use email registration."

## User Experience

- OAuth buttons always visible but show helpful tooltips
- Clear error messages guide users to email registration
- Smooth fallback to email/password authentication
- No broken functionality - email auth always works

## Security Notes

- Google OAuth uses standard OAuth 2.0 flow with PKCE
- Apple Sign-In uses JWT tokens with Apple's public key verification
- All OAuth flows integrated with existing session management
- Account linking by email address for users switching auth methods

## Development vs Production

**Development:**
- OAuth redirect URIs must include `localhost:5000`
- Apple Sign-In works with any domain in development mode

**Production:**
- Update OAuth redirect URIs to production domain
- Apple Sign-In requires verified domain ownership
- Ensure HTTPS for all OAuth callbacks