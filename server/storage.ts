import {
  users,
  foodLogs,
  weeklyScores,
  dailyBonuses,
  failedWebhooks,
  type User,
  type UpsertUser,
  type InsertFoodLog,
  type FoodLog,
  type WeeklyScore,
  type DailyBonus,
  type InsertDailyBonus,
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
  markGdprBannerSeen(userId: string): Promise<User>;
  
  // Gamification operations
  updateUserPoints(userId: string, pointsToAdd: number): Promise<User>;
  updateStreak(userId: string, verdict: string): Promise<User>;
  updateCalorieGoal(userId: string, goal: number): Promise<User>;
  resetWeeklyPoints(): Promise<void>;
  
  // Password management
  updatePasswordResetToken(userId: string, token: string, expires: Date): Promise<User>;
  updatePassword(userId: string, passwordHash: string): Promise<User>;
  
  // Account management
  deleteUserAccount(userId: string): Promise<void>;
  
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
  
  // Challenge operations
  getAllCompletedChallenges(userId: string): Promise<FoodLog[]>;
  
  // Daily bonus operations
  wasBonusAwardedToday(userId: string, bonusType: string): Promise<boolean>;
  markBonusAwarded(userId: string, bonusType: string): Promise<void>;
  addBonusToWeeklyScore(userId: string, bonusPoints: number): Promise<void>;
  
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
        gdprConsent: consentData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async markGdprBannerSeen(userId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        hasSeenGdprBanner: true,
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
    
    return logs;
  }

  // Get ALL analyzed foods today (for challenges) - both logged and not logged
  // Uses Madrid timezone for consistent daily reset behavior
  async getTodaysAnalyzedFoods(userId: string): Promise<FoodLog[]> {
    const madridTime = this.getMadridTime();
    const startOfDay = new Date(madridTime);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(madridTime);
    endOfDay.setHours(23, 59, 59, 999);

    return await db
      .select()
      .from(foodLogs)
      .where(and(
        eq(foodLogs.userId, userId),
        between(foodLogs.createdAt, startOfDay, endOfDay)
      ))
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
      
      // Update weekly score
      const [existing] = await db
        .select()
        .from(weeklyScores)
        .where(and(eq(weeklyScores.userId, userId), eq(weeklyScores.weekStart, weekStart)))
        .limit(1);

      if (existing) {
        await db
          .update(weeklyScores)
          .set({
            yesCount: verdict === "YES" ? (existing.yesCount || 0) + 1 : (existing.yesCount || 0),
            noCount: verdict === "NO" ? (existing.noCount || 0) + 1 : (existing.noCount || 0),
            okCount: verdict === "OK" ? (existing.okCount || 0) + 1 : (existing.okCount || 0),
            weeklyPoints: (existing.weeklyPoints || 0) + verdictPoints,
          })
          .where(and(eq(weeklyScores.userId, userId), eq(weeklyScores.weekStart, weekStart)));
      } else {
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

      // Also update total points for level progression (dual system)
      await this.updateUserPoints(userId, verdictPoints);
      
      await this.updateWeeklyRanks(weekStart);
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
            weeklyPoints: (existing.weeklyPoints || 0) + bonusPoints,
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

  // Prevent duplicate bonus awards (Madrid timezone - daily bonuses only)
  async wasBonusAwardedToday(userId: string, bonusType: string): Promise<boolean> {
    // Use Madrid timezone for consistent daily tracking
    const madridToday = this.getMadridTime();
    const dateAwarded = madridToday.toISOString().split('T')[0]; // YYYY-MM-DD format in Madrid timezone

    const [result] = await db
      .select()
      .from(dailyBonuses)
      .where(
        and(
          eq(dailyBonuses.userId, userId),
          eq(dailyBonuses.bonusType, bonusType),
          eq(dailyBonuses.dateAwarded, dateAwarded)
        )
      )
      .limit(1);
      
    const wasAwarded = !!result;
    console.log(`[Bonus Check] User ${userId}, Type: ${bonusType}, Date: ${dateAwarded}, Already awarded: ${wasAwarded}`);
    return wasAwarded;
  }

  async markBonusAwarded(userId: string, bonusType: string): Promise<void> {
    // Track daily bonus awards using proper table and Madrid timezone (daily reset)
    const madridToday = this.getMadridTime();
    const dateAwarded = madridToday.toISOString().split('T')[0]; // YYYY-MM-DD format in Madrid timezone
    
    // Determine bonus points based on challenge type
    const bonusPoints = {
      'first_analysis': 25,
      '5_analyses': 25,
      '10_analyses': 50,
      '3_yes_streak': 50,
      '5_yes_today': 100
    }[bonusType] || 25;
    
    await db
      .insert(dailyBonuses)
      .values({
        userId,
        bonusType,
        points: bonusPoints,
        dateAwarded,
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
    // Use Madrid timezone for consistent weekly reset behavior
    const madridNow = this.getMadridTime();
    const startOfWeek = new Date(madridNow);
    // Set Monday as first day of week (getDay() returns 0=Sunday, 1=Monday, etc.)
    const dayOfWeek = madridNow.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days to Monday
    startOfWeek.setDate(madridNow.getDate() - daysToSubtract);
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
    // Use Madrid timezone for consistent weekly reset behavior
    const madridNow = this.getMadridTime();
    const startOfWeek = new Date(madridNow);
    // Set Monday as first day of week (getDay() returns 0=Sunday, 1=Monday, etc.)
    const dayOfWeek = madridNow.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days to Monday
    startOfWeek.setDate(madridNow.getDate() - daysToSubtract);
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

  // Points management - handles lifetime points (never reset)
  // SIMPLE RULE: Always add points to total. No special first-week logic.
  async updateUserPoints(userId: string, pointsToAdd: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    // Simple accumulation - same points added to both weekly and total systems
    const newTotalPoints = (user.totalPoints || 0) + pointsToAdd;
    const newLevel = Math.floor(newTotalPoints / 1000) + 1; // 1000 points per level
    
    const [updatedUser] = await db
      .update(users)
      .set({ 
        totalPoints: newTotalPoints,
        currentLevel: newLevel,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    
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
    



    
    // Check if we need to update streak based on Madrid timezone
    if (!lastStreakDate || lastStreakDate < madridToday) {
      if (verdict === "NO") {
        // Reset streak to 0 if user logs a "NO" food
        newStreak = 0;
        // Streak reset for NO verdict
      } else {
        // Increment streak if it's a new day and not a "NO" verdict
        newStreak = (user.currentStreak || 0) + 1;
        // Streak incremented for positive verdict
      }
    } else if (verdict === "NO") {
      // Reset streak even on same day if "NO" verdict
      newStreak = 0;
      if (process.env.NODE_ENV === 'development') {
        console.log(`Streak reset to 0 due to NO verdict on same day`);
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log(`No streak change - same day, non-NO verdict`);
      }
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
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Streak updated: ${user.currentStreak} -> ${newStreak}`);
      console.log(`=== STREAK UPDATE COMPLETE ===\n`);
    }
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
      hasSeenPrivacyBanner: users.hasSeenGdprBanner,
      createdAt: users.createdAt,
    }).from(users)
    .where(eq(users.hasSeenGdprBanner, true))
    .orderBy(desc(users.createdAt));
    
    return result.map(user => ({
      ...user,
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      hasSeenPrivacyBanner: user.hasSeenPrivacyBanner || false,
      createdAt: user.createdAt || new Date(),
    }));
  }

  // Reset weekly points every Monday (Madrid time)
  async resetWeeklyPoints(): Promise<void> {
    try {
      await db.delete(weeklyScores);
      if (process.env.NODE_ENV === 'development') {
        console.log("Weekly points reset completed");
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error resetting weekly points:", error);
      }
    }
  }

  // Get Madrid time for consistent scheduling
  getMadridTime(): Date {
    // Get current UTC time and add Madrid offset
    const now = new Date();
    // Madrid is UTC+1 in winter, UTC+2 in summer (currently summer, so UTC+2)
    // For June 2025, Madrid is UTC+2 (CEST)
    return new Date(now.getTime() + (2 * 60 * 60 * 1000));
  }

  // Get all completed challenges for badge counting (all-time)
  async getAllCompletedChallenges(userId: string): Promise<FoodLog[]> {
    const challenges = await db
      .select()
      .from(foodLogs)
      .where(
        and(
          eq(foodLogs.userId, userId),
          sql`${foodLogs.foodName} LIKE 'BONUS_%'`
        )
      )
      .orderBy(desc(foodLogs.createdAt));
      
    return challenges;
  }

  // Delete user account and all associated data
  async deleteUserAccount(userId: string): Promise<void> {
    // Delete user's food logs
    await db.delete(foodLogs).where(eq(foodLogs.userId, userId));
    
    // Delete user's weekly scores
    await db.delete(weeklyScores).where(eq(weeklyScores.userId, userId));
    
    // Delete user's daily bonuses
    await db.delete(dailyBonuses).where(eq(dailyBonuses.userId, userId));
    
    // Finally delete the user record
    await db.delete(users).where(eq(users.id, userId));
  }

  // Failed webhook operations
  async createFailedWebhook(webhook: InsertFailedWebhook): Promise<FailedWebhook> {
    const [created] = await db
      .insert(failedWebhooks)
      .values(webhook)
      .returning();
    return created;
  }

  async getFailedWebhooks(): Promise<FailedWebhook[]> {
    return await db
      .select()
      .from(failedWebhooks)
      .where(eq(failedWebhooks.resolved, false))
      .orderBy(desc(failedWebhooks.createdAt));
  }

  async markWebhookResolved(id: number): Promise<void> {
    await db
      .update(failedWebhooks)
      .set({ resolved: true })
      .where(eq(failedWebhooks.id, id));
  }
}

export const storage = new DatabaseStorage();
