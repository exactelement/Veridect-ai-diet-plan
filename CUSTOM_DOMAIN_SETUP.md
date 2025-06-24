# Custom Domain Setup for veridect.com

## Replit Configuration

To configure the custom domain `veridect.com` for your Veridect application:

### 1. Domain Setup in Replit

1. Go to your Replit project settings
2. Navigate to the "Domains" section
3. Click "Add Custom Domain"
4. Enter `veridect.com` as your custom domain
5. Follow Replit's DNS configuration instructions

### 2. DNS Configuration

Configure the following DNS records with your domain provider:

```
Type: CNAME
Host: www
Value: your-replit-url.replit.app

Type: A
Host: @
Value: [Replit's IP address provided in domain setup]
```

### 3. Environment Variables Update

Add or update the following environment variable in your Replit Secrets:

```
REPLIT_DOMAINS=veridect.com,www.veridect.com
```

### 4. OAuth Configuration Updates

Update your OAuth provider configurations:

#### Google OAuth
- Update redirect URI in Google Cloud Console to: `https://veridect.com/api/auth/google/callback`
- Add `https://www.veridect.com/api/auth/google/callback` as well

#### Apple Sign-In
- Update redirect URI in Apple Developer Console to: `https://veridect.com/api/auth/apple/callback`
- Add `https://www.veridect.com/api/auth/apple/callback` as well

### 5. SSL Certificate

Replit automatically provides SSL certificates for custom domains. After DNS propagation (usually 24-48 hours), your domain will have HTTPS enabled.

### 6. Testing

Once configured, test the following:

1. Navigate to `https://veridect.com` - should load the application
2. Test Google OAuth login
3. Test Apple Sign-In (if configured)
4. Test password reset emails (should use correct domain in links)

### 7. Production Checklist

- [ ] Custom domain configured in Replit
- [ ] DNS records properly set
- [ ] REPLIT_DOMAINS environment variable updated
- [ ] Google OAuth redirect URIs updated
- [ ] Apple Sign-In redirect URIs updated (if applicable)
- [ ] SSL certificate active
- [ ] All authentication flows tested

## Code Changes Made

The following files have been updated to support the custom domain:

1. `server/multiAuth.ts` - Updated OAuth callback URLs and email base URLs
2. `client/src/pages/login.tsx` - Updated Apple Sign-In redirect URI

These changes ensure that:
- OAuth callbacks work with both development and production domains
- Password reset emails use the correct domain
- Apple Sign-In redirects properly

## Fallback Behavior

The application maintains backward compatibility:
- If `REPLIT_DOMAINS` is not set, it falls back to `veridect.com`
- Development environment (localhost) automatically uses production domain for OAuth
- Email links always use the production domain for consistency