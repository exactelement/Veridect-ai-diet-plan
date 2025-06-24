import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import session from "express-session";
import connectPg from "connect-pg-simple";
import type { Express } from "express";
import { storage } from "./storage";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail, generatePasswordResetEmail } from "./services/email";

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `https://${process.env.REPLIT_DOMAINS}/api/auth/google/callback`
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(new Error("No email found in Google profile"));
      }

      let user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Create new user from Google profile
        user = await storage.upsertUser({
          id: `google_${profile.id}`,
          email: email,
          firstName: profile.name?.givenName || "",
          lastName: profile.name?.familyName || "",
          profileImageUrl: profile.photos?.[0]?.value || null,
          authProvider: "google",
          googleId: profile.id,
          onboardingCompleted: false,
          subscriptionTier: "free",
          subscriptionStatus: "inactive",
        });
      } else if (!user.googleId) {
        // Link Google ID to existing account
        user = await storage.updateUserProfile(user.id, { googleId: profile.id });
        // Set a flag to show account linking message
        (user as any).accountLinked = true;
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
} else {
  console.log("⚠️  Google OAuth not configured - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
  console.log("📖 To enable Google login, see OAUTH_SETUP_GUIDE.md for detailed instructions");
}

// Local Strategy (Email/Password)
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await storage.getUserByEmail(email);
    
    if (!user || !user.passwordHash) {
      return done(null, false, { message: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValidPassword) {
      return done(null, false, { message: 'Invalid email or password' });
    }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

export async function setupMultiAuth(app: Express) {
  // Session configuration
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  app.use(session({
    secret: process.env.SESSION_SECRET || "fallback-secret-key-for-development",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: sessionTtl,
    },
  }));

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport serialization
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      if (!id) {
        return done(null, false);
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      // Silently handle deserialization errors to avoid log spam
      done(null, false);
    }
  });

  // Google OAuth routes (only if Google is configured)
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    app.get('/api/auth/google',
      passport.authenticate('google', { scope: ['profile', 'email'] })
    );

    app.get('/api/auth/google/callback',
      passport.authenticate('google', { failureRedirect: '/login?error=google_failed' }),
      (req, res) => {
        const user = req.user as any;
        let redirect = user?.onboardingCompleted ? '/' : '/onboarding';
        
        // Add message if account was linked
        if (user?.accountLinked) {
          redirect += user?.onboardingCompleted ? '?message=google_linked' : '&message=google_linked';
        }
        
        res.redirect(redirect);
      }
    );
  } else {
    // Fallback routes when Google OAuth is not configured
    app.get('/api/auth/google', (req, res) => {
      res.redirect('/login?error=google_oauth_not_configured');
    });
  }

  // Replit Auth redirect
  app.get('/api/login', (req, res) => {
    // Redirect to email/password login page
    res.redirect('/#/login');
  });

  app.get('/api/callback', (req, res) => {
    // Handle Replit Auth callback by redirecting to login
    res.redirect('/#/login?message=Please use email/password login');
  });

  // Apple Sign-In implementation
  app.post('/api/auth/apple', async (req, res) => {
    try {
      const { identityToken, user } = req.body;
      
      if (!identityToken) {
        return res.status(400).json({ message: "Apple identity token is required" });
      }

      // Decode Apple JWT token (without verification for now - in production you'd verify with Apple's public key)
      const decoded = jwt.decode(identityToken) as any;
      
      if (!decoded || !decoded.sub) {
        return res.status(400).json({ message: "Invalid Apple identity token" });
      }

      const appleId = decoded.sub;
      const email = decoded.email || user?.email;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required for Apple Sign-In" });
      }

      // Check if user exists by email
      let existingUser = await storage.getUserByEmail(email);
      
      if (!existingUser) {
        // Create new user from Apple Sign-In
        const firstName = user?.name?.firstName || "";
        const lastName = user?.name?.lastName || "";
        
        existingUser = await storage.upsertUser({
          id: `apple_${appleId}`,
          email: email,
          firstName: firstName,
          lastName: lastName,
          authProvider: "apple",
          appleId: appleId,
        });
      }

      // Login the user
      req.logIn(existingUser, (err) => {
        if (err) {
          console.error("Apple login error:", err);
          return res.status(500).json({ message: "Login failed" });
        }
        res.json({ 
          message: "Apple Sign-In successful",
          user: existingUser,
          redirect: existingUser.onboardingCompleted ? "/" : "/onboarding"
        });
      });

    } catch (error) {
      console.error("Apple Sign-In error:", error);
      res.status(500).json({ message: "Apple Sign-In failed" });
    }
  });

  // Email/Password registration
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Please enter a valid email address" });
      }

      if (!firstName || !lastName) {
        return res.status(400).json({ message: "First name and last name are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email.toLowerCase().trim());
      if (existingUser) {
        return res.status(409).json({ message: "An account with this email already exists. Please try logging in instead." });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);
      
      // Create user
      const user = await storage.upsertUser({
        id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: email.toLowerCase().trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        passwordHash,
        authProvider: "email",
      });

      // Log them in
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Registration successful but login failed" });
        }
        res.json({ success: true, user: { id: user.id, email: user.email } });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Email/Password login
  app.post('/api/auth/login', (req, res, next) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Internal server error" });
      }
      
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed" });
        }
        res.json({ success: true, user: { id: user.id, email: user.email } });
      });
    })(req, res, next);
  });

  // Password reset request
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists for security
        return res.json({ message: "If the email exists, a password reset link has been sent." });
      }

      // Generate reset token
      const resetToken = Math.random().toString(36).substr(2, 32);
      const resetExpires = new Date(Date.now() + 3600000); // 1 hour

      await storage.updatePasswordResetToken(user.id, resetToken, resetExpires);

      // Send password reset email
      const host = req.get('host');
      const baseUrl = host?.includes('localhost') 
        ? `https://${process.env.REPLIT_DOMAINS?.split(',')[0] || 'e930017d-8dad-4af5-a1a8-a3a3f19c1d33-00-2g5wlhfsqnzid.janeway.replit.dev'}`
        : `${req.protocol}://${host}`;
      const emailParams = generatePasswordResetEmail(email, resetToken, baseUrl);
      
      const emailSent = await sendEmail(emailParams);
      
      if (!emailSent) {
        // Development mode: log token to console
        console.log(`Password reset token for ${email}: ${resetToken}`);
        console.log(`Reset URL: ${baseUrl}/login?token=${resetToken}`);
      }
      
      res.json({ 
        message: emailSent 
          ? "If the email exists, a password reset link has been sent."
          : "Password reset initiated. Check server console for reset link (development mode)."
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Password reset
  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }

      const user = await storage.getUserByResetToken(token);
      if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 12);

      await storage.updatePassword(user.id, passwordHash);

      res.json({ message: "Password reset successful" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout route
  app.get('/api/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
          return res.status(500).json({ message: "Session cleanup failed" });
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
      });
    });
  });

  app.post('/api/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
          return res.status(500).json({ message: "Session cleanup failed" });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true, message: "Logged out successfully" });
      });
    });
  });
}

// Authentication middleware
export function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}