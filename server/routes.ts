import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupMultiAuth, isAuthenticated } from "./multiAuth";
import { insertFoodLogSchema, updateUserProfileSchema } from "@shared/schema";
import { z } from "zod";
import { analyzeFoodWithGemini } from "./services/foodAnalysis";
import { checkSubscriptionLimits, TIER_PRICES } from "./services/subscriptionLimits";
import { rateLimit } from "./middleware/validation";
import { HealthCheckService } from "./services/healthChecks";
import { concurrencyProtection } from "./middleware/concurrencyProtection";
import { validateRequest, foodAnalysisSchema, foodLogSchema } from "./middleware/dataValidation";

// Helper function to check and award daily analysis challenges with race condition protection
async function checkAndAwardDailyChallenges(userId: string, todaysAnalyses: any[]) {
  try {
    // Award bonus points for analysis milestones - added to BOTH systems
    if (todaysAnalyses.length === 5) {
      const bonusAlreadyAwarded = await storage.wasBonusAwardedToday(userId, '5_analyses');
      if (!bonusAlreadyAwarded) {
        // 25 bonus points to BOTH lifetime and weekly points
        await storage.updateUserPoints(userId, 25);
        await storage.addBonusToWeeklyScore(userId, 25);
        await storage.markBonusAwarded(userId, '5_analyses');
      }
    }
    
    if (todaysAnalyses.length === 10) {
      const bonusAlreadyAwarded = await storage.wasBonusAwardedToday(userId, '10_analyses');
      if (!bonusAlreadyAwarded) {
        // 50 bonus points to BOTH lifetime and weekly points
        await storage.updateUserPoints(userId, 50);
        await storage.addBonusToWeeklyScore(userId, 50);
        await storage.markBonusAwarded(userId, '10_analyses');
      }
    }
  } catch (error) {
    // Daily challenge error handling - non-critical
  }
}

// Helper function to check and award food logging challenges with race condition protection
async function checkAndAwardFoodLoggingChallenges(userId: string) {
  try {
    const todaysLogs = await storage.getTodaysFoodLogs(userId);
    
    // Check for 3 YES foods in a row (consecutive from start of day)
    let consecutiveYes = 0;
    for (const log of todaysLogs) {
      if (log.verdict === "YES") {
        consecutiveYes++;
      } else {
        consecutiveYes = 0; // Reset on any non-YES food
      }
    }
    
    if (consecutiveYes >= 3) {
      const bonusAlreadyAwarded = await storage.wasBonusAwardedToday(userId, '3_yes_streak');
      if (!bonusAlreadyAwarded) {
        // 50 bonus points to BOTH lifetime and weekly points
        await storage.updateUserPoints(userId, 50);
        await storage.addBonusToWeeklyScore(userId, 50);
        await storage.markBonusAwarded(userId, '3_yes_streak');
      }
    }
    
    // Check for 5 YES foods today (logged foods only)
    const yesCount = todaysLogs.filter(log => log.verdict === "YES").length;
    if (yesCount === 5) {
      const bonusAlreadyAwarded = await storage.wasBonusAwardedToday(userId, '5_yes_today');
      if (!bonusAlreadyAwarded) {
        // 100 bonus points to lifetime AND weekly totals
        await storage.updateUserPoints(userId, 100);
        await storage.addBonusToWeeklyScore(userId, 100);
        await storage.markBonusAwarded(userId, '5_yes_today');
      }
    }
  } catch (error) {
    // Food logging challenge error handling - non-critical
  }
}

// Stripe setup - will be enabled when API key is provided
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20",
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint - always first for monitoring
  app.get('/health', async (req, res) => {
    const health = await HealthCheckService.getHealthStatus();
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  });
  
  // Basic liveness probe
  app.get('/ping', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Public API endpoints (no authentication required)
  
  // Get user count
  app.get('/api/users/count', async (req, res) => {
    try {
      const count = await storage.getUserCount();
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch user count' });
    }
  });

  // Get weekly leaderboard - shows all users (public endpoint)
  app.get('/api/leaderboard/weekly', async (req, res) => {
    try {
      const leaderboard = await storage.getWeeklyLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch weekly leaderboard' });
    }
  });

  // Auth middleware
  await setupMultiAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      // Always fetch fresh user data from database instead of cached session data
      const userId = req.user?.claims?.sub || req.user?.id;
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
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });



  // User profile routes
  app.put('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      
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
      res.status(400).json({ message: error.message || "Failed to update profile" });
    }
  });

  app.post('/api/user/complete-onboarding', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      const updatedUser = await storage.completeOnboarding(userId);
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });

  // Privacy consent endpoint - handles banner interaction
  app.put('/api/user/gdpr-consent', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      const { gdprConsent, hasSeenPrivacyBanner } = req.body;
      
      console.log('Privacy consent API called:', { userId, hasSeenPrivacyBanner });
      
      // Check if user already submitted consent - LIFETIME protection
      const user = await storage.getUser(userId);
      
      if (user?.hasSeenPrivacyBanner && hasSeenPrivacyBanner) {
        console.log('Privacy consent already submitted for user:', userId);
        return res.status(200).json({ 
          success: true,
          message: "Privacy consent already recorded for this user",
          alreadyRecorded: true,
          user: user
        });
      }
      
      // Save consent and mark privacy banner as seen PERMANENTLY
      const updatedUser = await storage.updatePrivacyBannerSeen(userId, gdprConsent);
      
      console.log('Privacy consent saved permanently for user:', userId);
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Privacy consent error:", error);
      res.status(500).json({ message: "Failed to update consent preferences" });
    }
  });

  // Food analysis routes with comprehensive protection
  app.post('/api/food/analyze', 
    isAuthenticated, 
    validateRequest({ body: foodAnalysisSchema }),
    rateLimit(20, 60 * 1000), // 20 requests per minute per user
    concurrencyProtection('analyze'), 
    rateLimit(10, 60 * 1000), 
    async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      if (!userId) {
        return res.status(400).json({ message: "User ID not found" });
      }
      
      const { foodName, imageData } = req.body;
      if (!foodName && !imageData) {
        return res.status(400).json({ message: "Either foodName or imageData is required" });
      }

      // Get user profile for personalized analysis
      const user = await storage.getUser(userId);
      const userTier = user?.subscriptionTier || 'free';
      
      // Check daily analysis limit
      const currentAnalyses = await storage.getTodaysAnalyzedFoods(userId);
      const limitCheck = checkSubscriptionLimits(userTier, 'dailyAnalyses', currentAnalyses.length, user?.email);
      
      if (!limitCheck.allowed) {
        return res.status(403).json({ 
          message: limitCheck.message,
          remainingAnalyses: limitCheck.remainingAnalyses,
          upgradeRequired: limitCheck.upgradeRequired
        });
      }
      
      const userProfile = {
        healthGoals: Array.isArray(user?.healthGoals) ? user.healthGoals as string[] : [],
        dietaryPreferences: Array.isArray(user?.dietaryPreferences) ? user.dietaryPreferences as string[] : [],
        allergies: Array.isArray(user?.allergies) ? user.allergies as string[] : [],
        fitnessLevel: 'Not specified',
        subscriptionTier: userTier
      };

      // Import food analysis service
      const { analyzeFoodWithGemini } = await import('./services/foodAnalysis');
      
      const analysis = await analyzeFoodWithGemini(foodName, imageData, userProfile);
      
      // Save EVERY analysis to database (isLogged: false until user clicks "Yum")
      // This ensures challenge counters track all analyzed foods
      const logData = insertFoodLogSchema.parse({
        userId,
        foodName: analysis.foodName,
        verdict: analysis.verdict,
        explanation: analysis.explanation,
        calories: analysis.calories,
        protein: analysis.protein,
        confidence: analysis.confidence,
        analysisMethod: analysis.method,
        isLogged: false, // Not logged until user clicks "Yum"
      });
      
      const savedLog = await storage.createFoodLog(logData);
      // Food analysis saved successfully - NO POINTS AWARDED
      
      // Award bonus points for completing daily challenges (analysis count only)
      const todaysAnalyses = await storage.getTodaysAnalyzedFoods(userId);
      await checkAndAwardDailyChallenges(userId, todaysAnalyses);
      
      res.json({ analysis });
    } catch (error: any) {
      console.error('Food analysis error:', error);
      // Return user-friendly error message
      res.status(500).json({ 
        message: "Unable to analyze food right now. Please try again or contact support if the issue persists." 
      });
    }
  });

  // Food logging endpoint for "Yum" button - require Pro tier
  app.post('/api/food-logs', 
    isAuthenticated, 
    rateLimit(30, 60 * 1000), // 30 food logs per minute
    async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      const user = await storage.getUser(userId);
      const userTier = user?.subscriptionTier || 'free';
      
      // Check if user has access to food logging
      const limitCheck = checkSubscriptionLimits(userTier, 'foodLogging', undefined, user?.email);
      if (!limitCheck.allowed) {
        return res.status(403).json({ 
          message: limitCheck.message,
          upgradeRequired: limitCheck.upgradeRequired
        });
      }
      
      const { foodName, verdict } = req.body;
      
      // Find the most recent analysis of this food that hasn't been logged yet
      const recentAnalysis = await storage.findRecentUnloggedAnalysis(userId, foodName, verdict);
      
      let foodLog;
      if (recentAnalysis) {
        // Update existing analysis to mark as logged
        foodLog = await storage.updateFoodLogToLogged(recentAnalysis.id);
        // Updated existing analysis to logged
      } else {
        // Fallback: create new entry if no recent analysis found
        const logData = insertFoodLogSchema.parse({
          userId,
          analysisMethod: req.body.analysisMethod || "ai",
          isLogged: true,
          ...req.body
        });
        foodLog = await storage.createFoodLog(logData);
        // Created new food log entry
      }
      
      // Award food logging points - SINGLE SOURCE OF POINTS
      const foodPoints = verdict === "YES" ? 10 : verdict === "OK" ? 5 : 2;
      
      // Award to BOTH lifetime points (permanent) and weekly points (resets weekly)
      await storage.updateUserPoints(userId, foodPoints); // Lifetime points
      await storage.updateWeeklyScore(userId, verdict); // Weekly points system
      
      await storage.updateStreak(userId, verdict);
      
      // Check for food logging challenges (3 YES in a row, etc.)
      await checkAndAwardFoodLoggingChallenges(userId);
      
      res.json({ success: true, log: foodLog });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to log food" });
    }
  });

  app.get('/api/food/logs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      const user = await storage.getUser(userId);
      const userTier = user?.subscriptionTier || 'free';
      
      // Check if user has access to food history
      const limitCheck = checkSubscriptionLimits(userTier, 'foodHistory', undefined, user?.email);
      if (!limitCheck.allowed) {
        return res.status(403).json({ 
          message: limitCheck.message,
          upgradeRequired: limitCheck.upgradeRequired
        });
      }
      
      const { limit = 50, offset = 0 } = req.query;
      const logs = await storage.getFoodLogs(userId, parseInt(limit), parseInt(offset));
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch food logs" });
    }
  });

  app.get('/api/food/logs/today', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      const user = await storage.getUser(userId);
      const userTier = user?.subscriptionTier || 'free';
      
      // Check if user has access to food history
      const limitCheck = checkSubscriptionLimits(userTier, 'foodHistory', undefined, user?.email);
      if (!limitCheck.allowed) {
        return res.status(403).json({ 
          message: limitCheck.message,
          upgradeRequired: limitCheck.upgradeRequired
        });
      }
      
      const logs = await storage.getTodaysFoodLogs(userId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's logs" });
    }
  });

  // Get ALL analyzed foods today (for challenges)
  app.get('/api/food/analyzed/today', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      const logs = await storage.getTodaysAnalyzedFoods(userId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's analyzed foods" });
    }
  });

  // Get current consecutive YES streak for today
  app.get('/api/food/yes-streak', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      const todaysLogs = await storage.getTodaysFoodLogs(userId);
      
      // Calculate consecutive YES streak (resets on any NO/OK food)
      let consecutiveYes = 0;
      for (const log of todaysLogs) {
        if (log.verdict === "YES") {
          consecutiveYes++;
        } else {
          consecutiveYes = 0; // Reset on any non-YES food
        }
      }
      
      res.json({ consecutiveYesStreak: consecutiveYes });
    } catch (error) {
      console.error("Error calculating YES streak:", error);
      res.status(500).json({ message: "Failed to calculate YES streak" });
    }
  });

  // Leaderboard routes - require Pro tier
  app.get('/api/leaderboard/weekly', isAuthenticated, async (req: any, res) => {
    const userId = req.user?.claims?.sub || req.user?.id;
    const user = await storage.getUser(userId);
    const userTier = user?.subscriptionTier || 'free';
    
    // Check if user has access to leaderboard
    const limitCheck = checkSubscriptionLimits(userTier, 'leaderboardAccess', undefined, user?.email);
    if (!limitCheck.allowed) {
      return res.status(403).json({ 
        message: limitCheck.message,
        upgradeRequired: limitCheck.upgradeRequired
      });
    }
    try {
      const leaderboard = await storage.getWeeklyLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  app.get('/api/leaderboard/my-score', isAuthenticated, async (req: any, res) => {
    const userId = req.user?.claims?.sub || req.user?.id;
    const user = await storage.getUser(userId);
    const userTier = user?.subscriptionTier || 'free';
    
    // Check if user has access to leaderboard
    const limitCheck = checkSubscriptionLimits(userTier, 'leaderboardAccess', undefined, user?.email);
    if (!limitCheck.allowed) {
      return res.status(403).json({ 
        message: limitCheck.message,
        upgradeRequired: limitCheck.upgradeRequired
      });
    }
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      const score = await storage.getUserWeeklyScore(userId);
      res.json(score);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user score" });
    }
  });

  // Subscription routes
  
  // Validate coupon code
  app.post('/api/subscription/validate-coupon', isAuthenticated, async (req: any, res) => {
    try {
      const { couponCode } = req.body;
      
      if (!couponCode) {
        return res.status(400).json({ message: "Coupon code is required" });
      }

      // Retrieve coupon from Stripe
      const coupon = await stripe.coupons.retrieve(couponCode);
      
      if (!coupon.valid) {
        return res.status(400).json({ message: "This coupon code is no longer valid" });
      }

      res.json({
        coupon: {
          id: coupon.id,
          percent_off: coupon.percent_off,
          amount_off: coupon.amount_off,
          currency: coupon.currency,
          name: coupon.name,
          valid: coupon.valid
        }
      });
    } catch (error: any) {
      if (error.code === 'resource_missing') {
        return res.status(400).json({ message: "Invalid coupon code" });
      }
      res.status(500).json({ message: "Failed to validate coupon" });
    }
  });
  
  app.post('/api/subscription/create', isAuthenticated, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Payment processing temporarily unavailable" });
      }

      const userId = req.user?.claims?.sub || req.user?.id;
      const { tier, couponCode } = req.body;

      if (!['pro', 'advanced'].includes(tier)) {
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

      // Check for required Stripe configuration (only Pro tier for now)
      if (!process.env.STRIPE_PRO_PRICE_ID) {
        return res.status(503).json({ 
          message: "Subscription service is temporarily unavailable. Stripe configuration is incomplete.",
          details: "Please contact support or try again later."
        });
      }

      // Advanced tier not available yet
      if (tier === 'advanced') {
        return res.status(503).json({ 
          message: "Advanced tier is coming soon! Pro tier is available now.",
          details: "Try the Pro tier for unlimited analyses and premium features."
        });
      }

      const priceId = process.env.STRIPE_PRO_PRICE_ID; // Only Pro tier available

      const subscriptionData: any = {
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      };

      // Apply coupon if provided
      if (couponCode) {
        subscriptionData.coupon = couponCode;
      }

      const subscription = await stripe.subscriptions.create(subscriptionData);

      await storage.updateUserStripeInfo(userId, {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        subscriptionTier: 'free', // Keep free until payment succeeds
        subscriptionStatus: 'pending',
      });

      const latestInvoice = subscription.latest_invoice as any;
      const paymentIntent = latestInvoice?.payment_intent;

      // Handle 100% discount coupons that don't require payment
      if (!paymentIntent) {
        // For 100% discount coupons, mark subscription as active immediately
        await storage.updateUserStripeInfo(userId, {
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id,
          subscriptionTier: 'pro',
          subscriptionStatus: 'active',
        });

        return res.json({
          subscriptionId: subscription.id,
          clientSecret: null, // No payment needed
          success: true,
          message: "Subscription activated with 100% discount"
        });
      }

      res.json({
        subscriptionId: subscription.id,
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error: any) {
      console.error('Subscription creation error:', error);
      res.status(500).json({ 
        message: "Unable to process subscription. Please try again or contact support." 
      });
    }
  });

  // Subscription sync endpoint - manually check Stripe status if webhook fails
  app.post('/api/subscription/sync', isAuthenticated, async (req: any, res) => {
    if (!stripe) {
      return res.status(503).json({ message: "Payment processing temporarily unavailable" });
    }

    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      const user = await storage.getUser(userId);
      
      if (!user?.stripeCustomerId) {
        return res.status(400).json({ message: "No payment information found" });
      }

      // Get all subscriptions for this customer
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: 'all'
      });

      let activeSubscription = null;
      let userTier = 'free';
      let status = 'none';

      // Find the most recent active subscription
      for (const sub of subscriptions.data) {
        if (sub.status === 'active' || sub.status === 'trialing') {
          activeSubscription = sub;
          // Determine tier from price ID
          const priceId = sub.items.data[0]?.price?.id;
          if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
            userTier = 'pro';
          } else if (priceId === process.env.STRIPE_ADVANCED_PRICE_ID) {
            userTier = 'advanced';
          }
          status = sub.status;
          break;
        }
      }

      // Update user subscription info in database
      await storage.updateUserStripeInfo(userId, {
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: activeSubscription?.id || null,
        subscriptionTier: userTier,
        subscriptionStatus: status,
      });

      res.json({
        success: true,
        tier: userTier,
        status: status,
        synced: true,
        message: activeSubscription ? "Subscription synced successfully" : "No active subscription found"
      });
    } catch (error: any) {
      console.error('Subscription sync error:', error);
      res.status(500).json({ 
        message: "Unable to sync subscription status. Please contact support if the issue persists." 
      });
    }
  });

  // Get current subscription status
  app.get('/api/subscription/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      const user = await storage.getUser(userId);
      
      if (!user?.stripeSubscriptionId || !stripe) {
        return res.json({
          tier: user?.subscriptionTier || 'free',
          status: user?.subscriptionStatus || 'inactive',
          canCancel: false
        });
      }

      const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      
      res.json({
        tier: user.subscriptionTier,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: subscription.current_period_end,
        canCancel: ['active', 'trialing'].includes(subscription.status)
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch subscription status" });
    }
  });

  app.post('/api/subscription/cancel', isAuthenticated, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Payment processing temporarily unavailable" });
      }

      const userId = req.user?.claims?.sub || req.user?.id;
      const user = await storage.getUser(userId);
      
      if (!user?.stripeSubscriptionId) {
        return res.status(400).json({ message: "No active subscription found" });
      }

      // Check if already cancelled
      const currentSubscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      
      if (currentSubscription.cancel_at_period_end) {
        return res.status(400).json({ 
          message: "Subscription is already cancelled and will end at the current billing period." 
        });
      }

      // Cancel at period end to maintain access until billing cycle ends
      await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: true
      });

      // Update user subscription status in database
      await storage.updateUserStripeInfo(userId, {
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
        subscriptionTier: user.subscriptionTier, // Keep current tier until period ends
        subscriptionStatus: 'cancelling', // Mark as cancelling
      });

      res.json({ 
        message: "Subscription will be cancelled at the end of your current billing period",
        cancelAtPeriodEnd: true
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to cancel subscription" });
    }
  });

  // Reactivate cancelled subscription
  app.post('/api/subscription/reactivate', isAuthenticated, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Payment processing temporarily unavailable" });
      }

      const userId = req.user?.claims?.sub || req.user?.id;
      const user = await storage.getUser(userId);
      
      if (!user?.stripeSubscriptionId) {
        return res.status(400).json({ message: "No subscription found" });
      }

      await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: false
      });

      res.json({ message: "Subscription reactivated successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to reactivate subscription" });
    }
  });

  // Webhook for Stripe events
  app.post('/api/webhook/stripe', async (req, res) => {
    if (!stripe) {
      // Stripe not initialized
      return res.status(503).json({ message: "Payment processing temporarily unavailable" });
    }

    const sig = req.headers['stripe-signature'] as string;
    
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(400).json({ message: "Webhook secret not configured" });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'invoice.payment_succeeded':
          const invoice = event.data.object as any;
          if (invoice.subscription) {
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
            const users = await storage.getUsersByStripeSubscriptionId(subscription.id);
            
            // Determine tier from subscription items
            const tier = subscription.items.data[0]?.price?.id === process.env.STRIPE_PRO_PRICE_ID ? 'pro' : 'advanced';
            
            for (const user of users) {
              await storage.updateUserStripeInfo(user.id, {
                subscriptionTier: tier,
                subscriptionStatus: 'active',
              });
              // User upgraded to tier - payment succeeded
            }
          }
          break;
        case 'invoice.payment_failed':
          const failedInvoice = event.data.object as any;
          if (failedInvoice.subscription) {
            const users = await storage.getUsersByStripeSubscriptionId(failedInvoice.subscription as string);
            for (const user of users) {
              await storage.updateUserStripeInfo(user.id, {
                subscriptionTier: 'free',
                subscriptionStatus: 'payment_failed',
              });
              // User downgraded to free - payment failed
            }
          }
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
      // Log webhook processing errors for debugging
      console.error('Webhook processing error:', error);
      
      // Store failed webhook for manual retry
      try {
        await storage.createFailedWebhook({
          stripeEventId: event.id,
          eventType: event.type,
          eventData: JSON.stringify(event.data),
          error: error instanceof Error ? error.message : 'Unknown error',
          retryCount: 0
        });
      } catch (dbError) {
        console.error('Failed to store webhook error:', dbError);
      }
    }

    res.json({ received: true });
  });

  // GDPR Data Export
  app.get('/api/auth/export-data', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
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
      res.status(500).json({ message: "Failed to export data" });
    }
  });



  // Admin endpoint to view GDPR email preferences
  app.get('/api/admin/email-preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      const user = await storage.getUser(userId);
      
      // Check if user is admin (you can modify this check as needed)
      const adminEmails = ['10xr.co@gmail.com', 'yesnolifestyleapp@gmail.com', 'quantaalgo@gmail.com'];
      if (!adminEmails.includes(user?.email || '')) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const emailPreferences = await storage.getEmailPreferences();
      res.json(emailPreferences);
    } catch (error) {
      console.error("Error fetching email preferences:", error);
      res.status(500).json({ message: "Failed to fetch email preferences" });
    }
  });

  // Public unsubscribe endpoint (no auth required for email links)
  app.post('/api/unsubscribe', async (req, res) => {
    try {
      const { email, token, preferences, unsubscribeAll } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email address is required" });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Simple token validation (in production, use signed tokens with expiration)
      const expectedToken = Buffer.from(`unsubscribe:${email}:${user.id}`).toString('base64');
      if (token && token !== expectedToken) {
        return res.status(400).json({ message: "Invalid unsubscribe token" });
      }

      let updatedConsent;
      if (unsubscribeAll) {
        // Unsubscribe from everything
        updatedConsent = {
          nutritionInsightsEmails: false,
          improveAIRecommendations: false,
          anonymousUsageAnalytics: false,
          timestamp: new Date().toISOString(),
          version: "1.0",
          unsubscribedAt: new Date().toISOString()
        };
      } else {
        // Update specific preferences
        updatedConsent = {
          ...preferences,
          timestamp: new Date().toISOString(),
          version: "1.0",
          lastModified: new Date().toISOString()
        };
      }

      await storage.updatePrivacyBannerSeen(user.id, updatedConsent);
      
      res.json({ 
        success: true, 
        message: unsubscribeAll ? "Successfully unsubscribed from all emails" : "Email preferences updated" 
      });
    } catch (error) {
      console.error("Unsubscribe error:", error);
      res.status(500).json({ message: "Failed to update email preferences" });
    }
  });

  // GDPR Account Deletion
  app.delete('/api/auth/delete-account', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      
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
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
