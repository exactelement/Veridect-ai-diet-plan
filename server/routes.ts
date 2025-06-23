import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupMultiAuth, isAuthenticated } from "./multiAuth";
import { insertFoodLogSchema, updateUserProfileSchema } from "@shared/schema";
import { z } from "zod";

// Stripe setup - will be enabled when API key is provided
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-05-28.basil",
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for Cloud Run
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'veridect',
      version: process.env.npm_package_version || '1.0.0'
    });
  });

  // Public API endpoints (no authentication required)
  
  // Get user count
  app.get('/api/users/count', async (req, res) => {
    try {
      const count = await storage.getUserCount();
      res.json({ count });
    } catch (error) {
      console.error('Error fetching user count:', error);
      res.status(500).json({ message: 'Failed to fetch user count' });
    }
  });

  // Get weekly leaderboard - shows all users (public endpoint)
  app.get('/api/leaderboard/weekly', async (req, res) => {
    try {
      console.log('Fetching weekly leaderboard...');
      const leaderboard = await storage.getWeeklyLeaderboard();
      console.log('Leaderboard data:', leaderboard.length, 'users');
      res.json(leaderboard);
    } catch (error) {
      console.error('Error fetching weekly leaderboard:', error);
      res.status(500).json({ message: 'Failed to fetch weekly leaderboard' });
    }
  });

  // Auth middleware
  await setupMultiAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      // Always fetch fresh user data from database instead of cached session data
      const userId = req.user.id;
      const freshUser = await storage.getUser(userId);
      if (!freshUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Prevent caching to ensure fresh user data on every request
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      res.json(freshUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile routes
  app.put('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Get current user to merge with existing data
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Merge privacy settings with existing defaults
      const profileData = {
        ...req.body,
        privacySettings: {
          showCalorieCounter: true,
          participateInWeeklyChallenge: true,
          showFoodStats: true,
          showNutritionDetails: true,
          shareDataForResearch: false,
          allowMarketing: false,
          shareWithHealthProviders: false,
          ...currentUser.privacySettings,
          ...req.body.privacySettings
        }
      };
      
      const validatedData = updateUserProfileSchema.parse(profileData);
      const updatedUser = await storage.updateUserProfile(userId, validatedData);
      res.json(updatedUser);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      res.status(400).json({ message: error.message || "Failed to update profile" });
    }
  });

  app.post('/api/user/complete-onboarding', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const updatedUser = await storage.completeOnboarding(userId);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error completing onboarding:", error);
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });

  // GDPR Consent route
  app.post('/api/user/gdpr-consent', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const consentData = req.body;
      
      const updatedUser = await storage.updateGdprConsent(userId, consentData);
      res.json({ success: true, user: updatedUser });
    } catch (error: any) {
      console.error("Error updating GDPR consent:", error);
      res.status(500).json({ message: "Failed to update consent preferences" });
    }
  });

  // Food analysis routes
  app.post('/api/food/analyze', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { foodName, imageData } = req.body;

      if (!foodName && !imageData) {
        return res.status(400).json({ message: "Either foodName or imageData is required" });
      }

      // Get user profile for personalized analysis
      const user = await storage.getUser(userId);
      const userProfile = {
        healthGoals: Array.isArray(user?.healthGoals) ? user.healthGoals as string[] : [],
        dietaryPreferences: Array.isArray(user?.dietaryPreferences) ? user.dietaryPreferences as string[] : [],
        allergies: Array.isArray(user?.allergies) ? user.allergies as string[] : [],
        fitnessLevel: 'Not specified',
        subscriptionTier: user?.subscriptionTier || 'Free'
      };

      // Import food analysis service
      const { analyzeFoodWithGemini } = await import('./services/foodAnalysis');
      
      const analysis = await analyzeFoodWithGemini(foodName, imageData, userProfile);
      
      // Only return analysis - NO automatic logging
      // User must click "Yum" to actually log the food
      res.json({ analysis });
    } catch (error: any) {
      console.error("Error analyzing food:", error);
      res.status(500).json({ message: error.message || "Failed to analyze food" });
    }
  });

  // Food logging endpoint for "Yum" button
  app.post('/api/food-logs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      const logData = insertFoodLogSchema.parse({
        userId,
        analysisMethod: req.body.analysisMethod || "ai",
        isLogged: true, // Mark as logged when "Yum" is clicked
        ...req.body
      });
      
      const foodLog = await storage.createFoodLog(logData);
      
      // Award food logging points and update streak
      const foodPoints = req.body.verdict === "YES" ? 10 : req.body.verdict === "OK" ? 5 : 2;
      await storage.updateUserPoints(userId, foodPoints); // Adds to lifetime points for level progression
      await storage.updateWeeklyScore(userId, req.body.verdict); // Adds to weekly points for leaderboard
      await storage.updateStreak(userId, req.body.verdict);
      
      res.json({ success: true, log: foodLog });
    } catch (error: any) {
      console.error("Error creating food log:", error);
      res.status(400).json({ message: error.message || "Failed to log food" });
    }
  });

  app.get('/api/food/logs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { limit = 50, offset = 0 } = req.query;
      const logs = await storage.getFoodLogs(userId, parseInt(limit), parseInt(offset));
      res.json(logs);
    } catch (error) {
      console.error("Error fetching food logs:", error);
      res.status(500).json({ message: "Failed to fetch food logs" });
    }
  });

  app.get('/api/food/logs/today', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const logs = await storage.getTodaysFoodLogs(userId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching today's logs:", error);
      res.status(500).json({ message: "Failed to fetch today's logs" });
    }
  });

  // Get ALL analyzed foods today (for challenges)
  app.get('/api/food/analyzed/today', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const logs = await storage.getTodaysAnalyzedFoods(userId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching today's analyzed foods:", error);
      res.status(500).json({ message: "Failed to fetch today's analyzed foods" });
    }
  });

  // Leaderboard routes
  app.get('/api/leaderboard/weekly', isAuthenticated, async (req: any, res) => {
    try {
      const leaderboard = await storage.getWeeklyLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  app.get('/api/leaderboard/my-score', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const score = await storage.getUserWeeklyScore(userId);
      res.json(score);
    } catch (error) {
      console.error("Error fetching user score:", error);
      res.status(500).json({ message: "Failed to fetch user score" });
    }
  });

  // Subscription routes
  app.post('/api/subscription/create', isAuthenticated, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Payment processing temporarily unavailable" });
      }

      const userId = req.user.id;
      const { tier } = req.body;

      if (!['pro', 'medical'].includes(tier)) {
        return res.status(400).json({ message: "Invalid subscription tier" });
      }

      const user = await storage.getUser(userId);
      if (!user?.email) {
        return res.status(400).json({ message: "User email required for subscription" });
      }

      let customerId = user.stripeCustomerId;
      
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
        });
        customerId = customer.id;
        await storage.updateStripeCustomerId(userId, customerId);
      }

      const priceId = tier === 'pro' 
        ? process.env.STRIPE_PRO_PRICE_ID 
        : process.env.STRIPE_MEDICAL_PRICE_ID;

      if (!priceId) {
        throw new Error(`Missing price ID for ${tier} tier`);
      }

      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      await storage.updateUserStripeInfo(userId, {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        subscriptionTier: tier,
        subscriptionStatus: 'active',
      });

      const latestInvoice = subscription.latest_invoice as any;
      const paymentIntent = latestInvoice.payment_intent;

      res.json({
        subscriptionId: subscription.id,
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: error.message || "Failed to create subscription" });
    }
  });

  app.post('/api/subscription/cancel', isAuthenticated, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Payment processing temporarily unavailable" });
      }

      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.stripeSubscriptionId) {
        return res.status(400).json({ message: "No active subscription found" });
      }

      await stripe.subscriptions.cancel(user.stripeSubscriptionId);
      
      await storage.updateUserStripeInfo(userId, {
        subscriptionTier: 'free',
        subscriptionStatus: 'cancelled',
      });

      res.json({ message: "Subscription cancelled successfully" });
    } catch (error: any) {
      console.error("Error cancelling subscription:", error);
      res.status(500).json({ message: error.message || "Failed to cancel subscription" });
    }
  });

  // Webhook for Stripe events
  app.post('/api/webhook/stripe', async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ message: "Payment processing temporarily unavailable" });
    }

    const sig = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;

    try {
      if (!process.env.STRIPE_WEBHOOK_SECRET) {
        return res.status(400).json({ message: "Webhook secret not configured" });
      }
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'invoice.payment_succeeded':
          const invoice = event.data.object as any;
          if (invoice.subscription) {
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
            // Update user subscription status
            const users = await storage.getUsersByStripeSubscriptionId(subscription.id);
            for (const user of users) {
              await storage.updateUserStripeInfo(user.id, {
                subscriptionStatus: 'active',
              });
            }
          }
          break;
        case 'invoice.payment_failed':
          // Handle failed payment
          break;
        case 'customer.subscription.deleted':
          const deletedSub = event.data.object as Stripe.Subscription;
          const usersToUpdate = await storage.getUsersByStripeSubscriptionId(deletedSub.id);
          for (const user of usersToUpdate) {
            await storage.updateUserStripeInfo(user.id, {
              subscriptionTier: 'free',
              subscriptionStatus: 'cancelled',
            });
          }
          break;
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
    }

    res.json({ received: true });
  });

  // GDPR Data Export
  app.get('/api/auth/export-data', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      const foodLogs = await storage.getFoodLogs(userId, 1000, 0);
      const weeklyScore = await storage.getUserWeeklyScore(userId);

      const exportData = {
        user: {
          id: user?.id,
          email: user?.email,
          firstName: user?.firstName,
          lastName: user?.lastName,
          createdAt: user?.createdAt,
          healthGoals: user?.healthGoals,
          dietaryPreferences: user?.dietaryPreferences,
          allergies: user?.allergies,
          subscriptionTier: user?.subscriptionTier,
        },
        foodLogs: foodLogs,
        weeklyScore: weeklyScore,
        exportDate: new Date().toISOString(),
        exportedBy: 'YesNoApp GDPR Export'
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="yesnoapp-data-export.json"');
      res.json(exportData);
    } catch (error) {
      console.error("Error exporting user data:", error);
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  // Update GDPR consent
  app.post("/api/user/gdpr-consent", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
      const { gdprConsent, gdprBannerShown } = req.body;
      
      const updatedUser = await storage.updateGdprConsent(userId, {
        gdprConsent,
        gdprBannerShown
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating GDPR consent:", error);
      res.status(500).json({ message: "Failed to update consent preferences" });
    }
  });

  // GDPR Account Deletion
  app.delete('/api/auth/delete-account', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Mark user as deleted (anonymize data)
      await storage.updateUserProfile(userId, {
        email: `deleted-${Date.now()}@deleted.com`,
        firstName: 'DELETED',
        lastName: 'USER',
        profileImageUrl: null,
      });

      // Destroy session
      req.logout(() => {
        res.json({ message: "Account deleted successfully" });
      });
    } catch (error) {
      console.error("Error deleting user account:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
