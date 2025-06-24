import type { Express } from "express";
import jwt from "jsonwebtoken";
import { storage } from "./storage";

// Apple's public keys for JWT verification (you'll need to fetch these)
const APPLE_PUBLIC_KEYS_URL = 'https://appleid.apple.com/auth/keys';

interface AppleIdToken {
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  sub: string;
  at_hash: string;
  email?: string;
  email_verified?: boolean;
  auth_time: number;
}

interface AppleUser {
  name?: {
    firstName: string;
    lastName: string;
  };
  email?: string;
}

export function setupAppleAuth(app: Express) {
  // Apple Sign-In callback endpoint
  app.post('/api/auth/apple', async (req, res) => {
    try {
      const { identityToken, authorizationCode, user } = req.body;

      if (!identityToken) {
        return res.status(400).json({ 
          message: "Identity token is required" 
        });
      }

      // Decode the identity token (without verification for now)
      // In production, you should verify the token with Apple's public keys
      const decodedToken = jwt.decode(identityToken) as AppleIdToken;
      
      if (!decodedToken || !decodedToken.sub) {
        return res.status(400).json({ 
          message: "Invalid identity token" 
        });
      }

      // Extract user information
      const appleUserId = decodedToken.sub;
      const email = decodedToken.email || user?.email;
      const firstName = user?.name?.firstName || "";
      const lastName = user?.name?.lastName || "";

      // Check if user exists
      let existingUser = await storage.getUserByAppleId?.(appleUserId);
      
      if (!existingUser && email) {
        // Try to find by email
        existingUser = await storage.getUserByEmail(email);
        
        if (existingUser) {
          // Link Apple ID to existing account
          await storage.updateAppleId?.(existingUser.id, appleUserId);
        }
      }

      if (!existingUser) {
        // Create new user
        const newUser = await storage.upsertUser({
          appleId: appleUserId,
          email: email,
          firstName: firstName,
          lastName: lastName,
          authProvider: "apple",
          onboardingCompleted: false,
        });

        // Set up session
        (req as any).session.user = {
          id: newUser.id,
          email: newUser.email,
          authProvider: "apple"
        };

        return res.json({
          success: true,
          user: newUser,
          redirect: "/onboarding"
        });
      } else {
        // Existing user login
        (req as any).session.user = {
          id: existingUser.id,
          email: existingUser.email,
          authProvider: "apple"
        };

        return res.json({
          success: true,
          user: existingUser,
          redirect: existingUser.onboardingCompleted ? "/" : "/onboarding"
        });
      }

    } catch (error) {
      console.error("Apple authentication error:", error);
      res.status(500).json({ 
        message: "Authentication failed" 
      });
    }
  });

  // Apple Sign-In callback for web redirects
  app.get('/api/auth/apple/callback', async (req, res) => {
    try {
      // Handle the callback from Apple's redirect
      const { code, state } = req.query;
      
      if (!code) {
        return res.redirect('/login?error=apple_auth_failed');
      }

      // Exchange authorization code for tokens
      // This would require additional implementation with Apple's token endpoint
      
      res.redirect('/');
    } catch (error) {
      console.error("Apple callback error:", error);
      res.redirect('/login?error=apple_auth_failed');
    }
  });
}

// Helper function to verify Apple ID token (implement when needed)
export async function verifyAppleIdToken(identityToken: string): Promise<AppleIdToken | null> {
  try {
    // This would fetch Apple's public keys and verify the JWT
    // For now, just decode without verification
    const decoded = jwt.decode(identityToken) as AppleIdToken;
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}