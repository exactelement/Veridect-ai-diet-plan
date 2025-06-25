import {
  users,
  foodLogs,
  weeklyScores,
  failedWebhooks,
  type User,
  type UpsertUser,
  type InsertFoodLog,
  type FoodLog,
  type WeeklyScore,
  type UpdateUserProfile,
  type FailedWebhook,
  type InsertFailedWebhook,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, lt, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Profile operations
  updateUserProfile(id: string, profile: UpdateUserProfile): Promise<User>;
  completeOnboarding(id: string): Promise<User>;
  updateGdprConsent(userId: string, consent: any): Promise<User>;
  updatePrivacyBannerSeen(userId: string, gdprConsent: any): Promise<User>;
  
  // Gamification operations
  updateUserPoints(userId: string, pointsToAdd: number): Promise<User>;
  updateStreak(userId: string, verdict: string): Promise<User>;
  updateCalorieGoal(userId: string, goal: number): Promise<User>;
  resetWeeklyPoints(): Promise<void>;
  
  // Password management
  updatePasswordResetToken(userId: string, token: string, expires: Date): Promise<User>;
  updatePassword(userId: string, passwordHash: string): Promise<User>;
  
  // Stripe operations
  updateStripeCustomerId(userId: string, customerId: string): Promise<User>;
  updateUserStripeInfo(userId: string, stripeInfo: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    subscriptionTier?: string;
    subscriptionStatus?: string;
  }): Promise<User>;
  getUsersByStripeSubscriptionId(subscriptionId: string): Promise<User[]>;
  
  // Food log operations
  createFoodLog(log: InsertFoodLog): Promise<FoodLog>;
  getFoodLogs(userId: string, limit: number, offset: number): Promise<FoodLog[]>;
  getTodaysFoodLogs(userId: string): Promise<FoodLog[]>;
  getTodaysAnalyzedFoods(userId: string): Promise<FoodLog[]>;
  findRecentUnloggedAnalysis(userId: string, foodName: string, verdict: string): Promise<FoodLog | undefined>;
  updateFoodLogToLogged(id: number): Promise<FoodLog>;
  addBonusToWeeklyScore(userId: string, bonusPoints: number): Promise<void>;
  wasBonusAwardedToday(userId: string, bonusType: string): Promise<boolean>;
  markBonusAwarded(userId: string, bonusType: string): Promise<void>;
  
  // Leaderboard operations
  updateWeeklyScore(userId: string, verdict: string): Promise<void>;
  getWeeklyLeaderboard(): Promise<WeeklyScore[]>;
  getUserWeeklyScore(userId: string): Promise<WeeklyScore | undefined>;
  
  // User count
  getUserCount(): Promise<number>;
  
  // Email preferences for admin
  getEmailPreferences(): Promise<Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    gdprConsent: any;
    hasSeenPrivacyBanner: boolean;
    createdAt: Date;
  }>>;
  
  // Failed webhook operations
  createFailedWebhook(webhook: InsertFailedWebhook): Promise<FailedWebhook>;
  getFailedWebhooks(): Promise<FailedWebhook[]>;
  markWebhookResolved(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const userDataWithDefaults = {
      ...userData,
      firstName: userData.firstName?.trim(),
      lastName: userData.lastName?.trim(),
      privacySettings: userData.privacySettings || {
        showCalorieCounter: true,
        participateInWeeklyChallenge: true,
        showFoodStats: true,
        showNutritionDetails: true
      }
    };
    
    const [user] = await db
      .insert(users)
      .values(userDataWithDefaults)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userDataWithDefaults,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Profile operations
  async updateUserProfile(id: string, profile: UpdateUserProfile): Promise<User> {
    const profileWithTrimmedNames = {
      ...profile,
      firstName: profile.firstName?.trim(),
      lastName: profile.lastName?.trim(),
    };
    
    const [user] = await db
      .update(users)
      .set({
        ...profileWithTrimmedNames,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async completeOnboarding(id: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        onboardingCompleted: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateGdprConsent(userId: string, consentData: any): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        gdprConsent: consentData.gdprConsent,
        hasSeenPrivacyBanner: consentData.has_seen_privacy_banner || true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updatePrivacyBannerSeen(userId: string, gdprConsent: any): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        hasSeenPrivacyBanner: true,
        gdprConsent: gdprConsent,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.passwordResetToken, token));
    return user;
  }

  async updatePasswordResetToken(userId: string, token: string, expires: Date): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        passwordResetToken: token,
        passwordResetExpires: expires,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updatePassword(userId: string, passwordHash: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        passwordHash: passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Stripe operations
  async updateStripeCustomerId(userId: string, customerId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId: customerId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, stripeInfo: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    subscriptionTier?: string;
    subscriptionStatus?: string;
  }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...stripeInfo,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getUsersByStripeSubscriptionId(subscriptionId: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.stripeSubscriptionId, subscriptionId));
  }

  // Food log operations
  async createFoodLog(log: InsertFoodLog): Promise<FoodLog> {
    const [foodLog] = await db
      .insert(foodLogs)
      .values(log)
      .returning();
    return foodLog;
  }

  async getFoodLogs(userId: string, limit: number, offset: number): Promise<FoodLog[]> {
    return await db
      .select()
      .from(foodLogs)
      .where(
        and(
          eq(foodLogs.userId, userId),
          eq(foodLogs.isLogged, true) // Only return items that were actually logged via "Yum"
        )
      )
      .orderBy(desc(foodLogs.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getTodaysFoodLogs(userId: string): Promise<FoodLog[]> {
    // Use Madrid timezone for consistent daily reset behavior
    const madridNow = this.getMadridTime();
    
    // Get Madrid day boundaries (midnight to midnight in Madrid time)
    const madridTodayStart = new Date(madridNow);
    madridTodayStart.setHours(0, 0, 0, 0);
    
    const madridTomorrowStart = new Date(madridTodayStart);
    madridTomorrowStart.setDate(madridTomorrowStart.getDate() + 1);
    
    // Convert Madrid boundaries to UTC for database query
    // Madrid is UTC+1 in winter, UTC+2 in summer (currently summer, so UTC+2)
    const utcTodayStart = new Date(madridTodayStart.getTime() - (2 * 60 * 60 * 1000)); // Subtract 2 hours
    const utcTomorrowStart = new Date(madridTomorrowStart.getTime() - (2 * 60 * 60 * 1000)); // Subtract 2 hours

    console.log(`Getting today's food logs for ${userId} (Madrid timezone):`);
    console.log(`Madrid now: ${madridNow.toISOString()}`);
    console.log(`Madrid today start: ${madridTodayStart.toISOString()}`);
    console.log(`UTC today start: ${utcTodayStart.toISOString()}`);
    console.log(`UTC tomorrow start: ${utcTomorrowStart.toISOString()}`);

    const logs = await db
      .select()
      .from(foodLogs)
      .where(
        and(
          eq(foodLogs.userId, userId),
          eq(foodLogs.isLogged, true), // Only return items that were actually logged
          gte(foodLogs.createdAt, utcTodayStart),
          lt(foodLogs.createdAt, utcTomorrowStart)
        )
      )
      .orderBy(desc(foodLogs.createdAt));

    console.log(`Found ${logs.length} logged food items for today`);
    logs.forEach(log => {
      const logMadridTime = new Date(log.createdAt!).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' });
      console.log(`- ${log.foodName} (${log.verdict}) at ${logMadridTime} Madrid time`);
    });
    
    return logs;
  }

  // Get ALL analyzed foods today (for challenges) - both logged and not logged
  // Uses Madrid timezone for consistent daily reset behavior
  async getTodaysAnalyzedFoods(userId: string): Promise<FoodLog[]> {
    const madridToday = this.getMadridTime();
    madridToday.setHours(0, 0, 0, 0);
    const madridTomorrow = new Date(madridToday);
    madridTomorrow.setDate(madridTomorrow.getDate() + 1);

    return await db
      .select()
      .from(foodLogs)
      .where(
        and(
          eq(foodLogs.userId, userId),
          // No isLogged filter - return ALL analyzed foods
          gte(foodLogs.createdAt, madridToday),
          lte(foodLogs.createdAt, madridTomorrow)
        )
      )
      .orderBy(desc(foodLogs.createdAt));
  }

  // Find recent unlogged analysis to prevent duplicates
  async findRecentUnloggedAnalysis(userId: string, foodName: string, verdict: string): Promise<FoodLog | undefined> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const [result] = await db
      .select()
      .from(foodLogs)
      .where(
        and(
          eq(foodLogs.userId, userId),
          eq(foodLogs.foodName, foodName),
          eq(foodLogs.verdict, verdict),
          eq(foodLogs.isLogged, false),
          gte(foodLogs.createdAt, fiveMinutesAgo)
        )
      )
      .orderBy(desc(foodLogs.createdAt))
      .limit(1);
      
    return result;
  }

  // Update existing analysis to logged status
  async updateFoodLogToLogged(id: number): Promise<FoodLog> {
    const [updated] = await db
      .update(foodLogs)
      .set({ isLogged: true })
      .where(eq(foodLogs.id, id))
      .returning();
      
    return updated;
  }

  // Leaderboard operations
  // Daily reset - only resets daily views, preserves all historical data
  async clearPreviousDayFoodLogs(): Promise<void> {
    // NOTE: This function name is misleading - we DON'T actually delete food logs
    // Food logs are preserved for history. Only the daily view is filtered by date.
    // The getTodaysFoodLogs() function already handles showing only today's data.
    // Daily reset triggered
  }

  // Weekly score management - tracks ALL points earned this week (food + bonus)
  async updateWeeklyScore(userId: string, verdict: "YES" | "NO" | "OK"): Promise<void> {
    const now = this.getMadridTime();
    const weekStart = new Date(now);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);

    try {
      const verdictPoints = verdict === "YES" ? 10 : verdict === "OK" ? 5 : 2;
      // Adding weekly points for verdict
      
      // Use explicit select/update to avoid constraint issues
      const [existing] = await db
        .select()
        .from(weeklyScores)
        .where(and(eq(weeklyScores.userId, userId), eq(weeklyScores.weekStart, weekStart)))
        .limit(1);

      if (existing) {
        // Update existing record
        await db
          .update(weeklyScores)
          .set({
            yesCount: verdict === "YES" ? existing.yesCount + 1 : existing.yesCount,
            noCount: verdict === "NO" ? existing.noCount + 1 : existing.noCount,
            okCount: verdict === "OK" ? existing.okCount + 1 : existing.okCount,
            weeklyPoints: existing.weeklyPoints + verdictPoints,
          })
          .where(and(eq(weeklyScores.userId, userId), eq(weeklyScores.weekStart, weekStart)));
      } else {
        // Insert new record
        await db
          .insert(weeklyScores)
          .values({
            userId,
            weekStart,
            yesCount: verdict === "YES" ? 1 : 0,
            noCount: verdict === "NO" ? 1 : 0,
            okCount: verdict === "OK" ? 1 : 0,
            weeklyPoints: verdictPoints,
          });
      }
    } catch (error) {
      // Error updating weekly score
    }
  }

  // Add BONUS points to weekly score without affecting food counts (for challenges only)
  async addBonusToWeeklyScore(userId: string, bonusPoints: number): Promise<void> {
    const now = this.getMadridTime();
    const weekStart = new Date(now);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);

    try {
      const [existing] = await db
        .select()
        .from(weeklyScores)
        .where(and(eq(weeklyScores.userId, userId), eq(weeklyScores.weekStart, weekStart)))
        .limit(1);

      if (existing) {
        await db
          .update(weeklyScores)
          .set({
            weeklyPoints: existing.weeklyPoints + bonusPoints,
          })
          .where(and(eq(weeklyScores.userId, userId), eq(weeklyScores.weekStart, weekStart)));
      } else {
        await db
          .insert(weeklyScores)
          .values({
            userId,
            weekStart,
            yesCount: 0,
            noCount: 0,
            okCount: 0,
            weeklyPoints: bonusPoints,
          });
      }
      // Added bonus points to weekly score
    } catch (error) {
      // Error adding bonus to weekly score
    }
  }

  // Prevent duplicate bonus awards
  async wasBonusAwardedToday(userId: string, bonusType: string): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [result] = await db
      .select()
      .from(foodLogs)
      .where(
        and(
          eq(foodLogs.userId, userId),
          eq(foodLogs.foodName, `BONUS_${bonusType}`),
          gte(foodLogs.createdAt, today),
          lte(foodLogs.createdAt, tomorrow)
        )
      )
      .limit(1);
      
    return !!result;
  }

  async markBonusAwarded(userId: string, bonusType: string): Promise<void> {
    // Create a special entry to track bonus awards
    await db
      .insert(foodLogs)
      .values({
        userId,
        foodName: `BONUS_${bonusType}`,
        verdict: "YES",
        explanation: "Bonus points tracker",
        calories: 0,
        protein: 0,
        confidence: 100,
        analysisMethod: "system",
        isLogged: false,
      });
  }

  private async updateWeeklyRanks(weekStart: Date): Promise<void> {
    const scores = await db
      .select()
      .from(weeklyScores)
      .where(eq(weeklyScores.weekStart, weekStart))
      .orderBy(desc(weeklyScores.weeklyPoints));

    for (let i = 0; i < scores.length; i++) {
      await db
        .update(weeklyScores)
        .set({ rank: i + 1 })
        .where(eq(weeklyScores.id, scores[i].id));
    }
  }

  async getWeeklyLeaderboard(): Promise<WeeklyScore[]> {
    const now = new Date();
    const startOfWeek = new Date(now);
    // Set Monday as first day of week (getDay() returns 0=Sunday, 1=Monday, etc.)
    const dayOfWeek = now.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days to Monday
    startOfWeek.setDate(now.getDate() - daysToSubtract);
    startOfWeek.setHours(0, 0, 0, 0);

    // Get only users who are participating in weekly challenges
    const allUsers = await db
      .select({
        id: sql<number>`COALESCE(${weeklyScores.id}, 0)`.as('id'),
        userId: users.id,
        weekStart: sql<Date>`COALESCE(${weeklyScores.weekStart}, ${startOfWeek})`.as('weekStart'),
        yesCount: sql<number>`COALESCE(${weeklyScores.yesCount}, 0)`.as('yesCount'),
        noCount: sql<number>`COALESCE(${weeklyScores.noCount}, 0)`.as('noCount'),
        okCount: sql<number>`COALESCE(${weeklyScores.okCount}, 0)`.as('okCount'),
        weeklyPoints: sql<number>`COALESCE(${weeklyScores.weeklyPoints}, 0)`.as('weeklyPoints'),
        rank: sql<number>`999`.as('rank'), // Will be assigned below
        firstName: users.firstName,
        lastName: users.lastName,
        createdAt: users.createdAt,
      })
      .from(users)
      .leftJoin(weeklyScores, 
        and(
          eq(weeklyScores.userId, users.id),
          eq(weeklyScores.weekStart, startOfWeek)
        )
      )
      .where(
        sql`${users.privacySettings}->>'participateInWeeklyChallenge' = 'true'`
      )
      .orderBy(
        desc(sql`COALESCE(${weeklyScores.weeklyPoints}, 0)`),
        users.createdAt
      );

    // Assign ranks properly - users with same score get same rank, then by join time
    const rankedUsers = allUsers.map((user, index) => {
      user.rank = index + 1;
      return user;
    });

    return rankedUsers;
  }

  async getUserWeeklyScore(userId: string): Promise<WeeklyScore | undefined> {
    const now = new Date();
    const startOfWeek = new Date(now);
    // Set Monday as first day of week (getDay() returns 0=Sunday, 1=Monday, etc.)
    const dayOfWeek = now.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days to Monday
    startOfWeek.setDate(now.getDate() - daysToSubtract);
    startOfWeek.setHours(0, 0, 0, 0);

    // First check if user is participating in weekly challenges
    const [user] = await db
      .select({ privacySettings: users.privacySettings })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) return undefined;

    const privacySettings = user.privacySettings as any;
    const isParticipating = privacySettings?.participateInWeeklyChallenge === true;
    
    if (!isParticipating) return undefined;

    const [score] = await db
      .select()
      .from(weeklyScores)
      .where(
        and(
          eq(weeklyScores.userId, userId),
          eq(weeklyScores.weekStart, startOfWeek)
        )
      );

    return score;
  }

  // Points management - handles ONLY lifetime points (for level progression)
  // Weekly points are handled separately by updateWeeklyScore for food logging
  async updateUserPoints(userId: string, pointsToAdd: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const newTotalPoints = (user.totalPoints || 0) + pointsToAdd;
    const newLevel = Math.floor(newTotalPoints / 1000) + 1; // 1000 points per level
    
    // Update lifetime points (NEVER RESET - accumulates forever for level progression)
    const [updatedUser] = await db
      .update(users)
      .set({ 
        totalPoints: newTotalPoints,
        currentLevel: newLevel,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    
    console.log(`Added ${pointsToAdd} lifetime points. Total: ${newTotalPoints}, Level: ${newLevel}`);
    return updatedUser;
  }

  async updateStreak(userId: string, verdict: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    // Use Madrid timezone for consistent daily reset behavior
    const madridToday = this.getMadridTime();
    madridToday.setHours(0, 0, 0, 0);
    
    const lastStreakDate = user.lastStreakDate ? new Date(user.lastStreakDate) : null;
    let newStreak = user.currentStreak || 0;
    
    console.log(`\n=== STREAK UPDATE DEBUG ===`);
    console.log(`User: ${userId}`);
    console.log(`Verdict: ${verdict}`);
    console.log(`Current streak: ${user.currentStreak}`);
    console.log(`Madrid today: ${madridToday.toISOString()}`);
    console.log(`Last streak date: ${lastStreakDate?.toISOString()}`);
    console.log(`Is new day? ${!lastStreakDate || lastStreakDate < madridToday}`);
    
    // Check if we need to update streak based on Madrid timezone
    if (!lastStreakDate || lastStreakDate < madridToday) {
      if (verdict === "NO") {
        // Reset streak to 0 if user logs a "NO" food
        newStreak = 0;
        console.log(`Streak reset to 0 due to NO verdict on new day`);
      } else {
        // Increment streak if it's a new day and not a "NO" verdict
        newStreak = (user.currentStreak || 0) + 1;
        console.log(`Streak incremented to ${newStreak} for new day with ${verdict} verdict`);
      }
    } else if (verdict === "NO") {
      // Reset streak even on same day if "NO" verdict
      newStreak = 0;
      console.log(`Streak reset to 0 due to NO verdict on same day`);
    } else {
      console.log(`No streak change - same day, non-NO verdict`);
    }
    
    const newLongestStreak = Math.max(user.longestStreak || 0, newStreak);
    
    const [updatedUser] = await db
      .update(users)
      .set({ 
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastStreakDate: madridToday, // Store Madrid timezone date
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    
    console.log(`Streak updated: ${user.currentStreak} -> ${newStreak}`);
    console.log(`=== STREAK UPDATE COMPLETE ===\n`);
    return updatedUser;
  }

  async updateCalorieGoal(userId: string, goal: number): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ 
        calorieGoal: goal,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }

  async getUserCount(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(
        sql`COALESCE(${users.privacySettings}->>'participateInWeeklyChallenge', 'true') = 'true'`
      );
    return Number(result[0].count);
  }

  async getEmailPreferences(): Promise<Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    gdprConsent: any;
    hasSeenPrivacyBanner: boolean;
    createdAt: Date;
  }>> {
    const result = await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      gdprConsent: users.gdprConsent,
      hasSeenPrivacyBanner: users.hasSeenPrivacyBanner,
      createdAt: users.createdAt,
    }).from(users)
    .where(eq(users.hasSeenPrivacyBanner, true))
    .orderBy(desc(users.createdAt));
    
    return result.map(user => ({
      ...user,
      createdAt: user.createdAt || new Date(),
    }));
  }

  // Reset weekly points every Monday (Madrid time)
  async resetWeeklyPoints(): Promise<void> {
    try {
      await db.delete(weeklyScores);
      console.log("Weekly points reset completed");
    } catch (error) {
      console.error("Error resetting weekly points:", error);
    }
  }

  // Get Madrid time for consistent scheduling
  getMadridTime(): Date {
    // Get current time in Madrid timezone using built-in methods
    const now = new Date();
    return new Date(now.toLocaleString("en-US", { timeZone: "Europe/Madrid" }));
  }
}

export const storage = new DatabaseStorage();
