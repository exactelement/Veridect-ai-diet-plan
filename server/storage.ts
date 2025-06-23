import {
  users,
  foodLogs,
  weeklyScores,
  type User,
  type UpsertUser,
  type InsertFoodLog,
  type FoodLog,
  type WeeklyScore,
  type UpdateUserProfile,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

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
  
  // Leaderboard operations
  updateWeeklyScore(userId: string, verdict: string): Promise<void>;
  getWeeklyLeaderboard(): Promise<WeeklyScore[]>;
  getUserWeeklyScore(userId: string): Promise<WeeklyScore | undefined>;
  
  // User count
  getUserCount(): Promise<number>;
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
    const [user] = await db
      .update(users)
      .set({
        ...profile,
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
        gdprBannerShown: consentData.gdprBannerShown,
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
      .where(eq(foodLogs.userId, userId))
      .orderBy(desc(foodLogs.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getTodaysFoodLogs(userId: string): Promise<FoodLog[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await db
      .select()
      .from(foodLogs)
      .where(
        and(
          eq(foodLogs.userId, userId),
          gte(foodLogs.createdAt, today),
          lte(foodLogs.createdAt, tomorrow)
        )
      )
      .orderBy(desc(foodLogs.createdAt));
  }

  // Leaderboard operations
  // Daily food log cleanup - clears yesterday's logs at midnight Madrid time
  async clearPreviousDayFoodLogs(): Promise<void> {
    try {
      // Get midnight today in Madrid time, then convert to UTC for database
      const now = new Date();
      
      // Create Madrid midnight today in UTC
      const madridMidnightUTC = new Date();
      madridMidnightUTC.setUTCHours(22, 0, 0, 0); // Madrid is UTC+2 in summer, so midnight Madrid = 22:00 UTC previous day
      
      // If it's already past Madrid midnight, we want today's midnight, not yesterday's
      if (now.getUTCHours() >= 22) {
        madridMidnightUTC.setUTCDate(madridMidnightUTC.getUTCDate() + 1);
      }
      
      console.log(`Current UTC time: ${now.toISOString()}`);
      console.log(`Madrid midnight UTC: ${madridMidnightUTC.toISOString()}`);
      console.log(`Deleting food logs before: ${madridMidnightUTC.toISOString()}`);
      
      // Delete all food logs from before today's Madrid midnight
      const result = await db
        .delete(foodLogs)
        .where(lt(foodLogs.createdAt, madridMidnightUTC));
      
      console.log(`Daily cleanup completed: Cleared food logs before Madrid midnight`);
    } catch (error) {
      console.error('Error during daily food log cleanup:', error);
    }
  }

  // Weekly score management - tracks ALL points earned this week (food + bonus)
  async updateWeeklyScore(userId: string, pointsToAdd: number): Promise<void> {
    const now = new Date();
    const madridTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Madrid" }));
    const dayOfWeek = madridTime.getDay(); // 0 = Sunday, 1 = Monday
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust for Monday start
    const weekStart = new Date(madridTime);
    weekStart.setDate(weekStart.getDate() - daysToMonday);
    weekStart.setHours(0, 0, 0, 0);

    const existingScore = await db
      .select()
      .from(weeklyScores)
      .where(
        and(
          eq(weeklyScores.userId, userId),
          eq(weeklyScores.weekStart, weekStart)
        )
      );

    if (existingScore.length > 0) {
      // Update existing score by adding points
      const score = existingScore[0];
      const currentTotal = parseInt(score.totalScore || "0");
      const newTotal = currentTotal + pointsToAdd;

      await db
        .update(weeklyScores)
        .set({ 
          totalScore: String(newTotal),
          updatedAt: new Date()
        })
        .where(eq(weeklyScores.id, score.id));
    } else {
      // Create new score entry
      await db
        .insert(weeklyScores)
        .values({
          userId,
          weekStart,
          totalScore: String(pointsToAdd),
          rank: 1 // Will be recalculated
        });
    }

    // Update ranks for all users this week
    await this.updateWeeklyRanks(weekStart);
  }

  private async updateWeeklyRanks(weekStart: Date): Promise<void> {
    const scores = await db
      .select()
      .from(weeklyScores)
      .where(eq(weeklyScores.weekStart, weekStart))
      .orderBy(desc(weeklyScores.totalScore));

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
        totalScore: sql<string>`COALESCE(${weeklyScores.totalScore}, '0')`.as('totalScore'),
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
        sql`COALESCE(${users.privacySettings}->>'participateInWeeklyChallenge', 'true') = 'true'`
      )
      .orderBy(
        desc(sql`CAST(COALESCE(${weeklyScores.totalScore}, '0') AS INTEGER)`),
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
    const isParticipating = privacySettings?.participateInWeeklyChallenge !== false;
    
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

  // Gamification operations - accumulates ALL points (food logging + bonus points)
  async updateUserPoints(userId: string, pointsToAdd: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const newTotalPoints = (user.totalPoints || 0) + pointsToAdd;
    const newLevel = Math.floor(newTotalPoints / 1000) + 1; // 1000 points per level
    
    // Update weekly points to include ALL points earned this week
    await this.updateWeeklyScore(userId, pointsToAdd);
    
    const [updatedUser] = await db
      .update(users)
      .set({ 
        totalPoints: newTotalPoints, // Lifetime accumulation: food logging + bonus points
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
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastStreakDate = user.lastStreakDate ? new Date(user.lastStreakDate) : null;
    let newStreak = user.currentStreak || 0;
    
    // Check if we need to update streak
    if (!lastStreakDate || lastStreakDate < today) {
      if (verdict === "NO") {
        // Reset streak to 0 if user logs a "NO" food
        newStreak = 0;
      } else {
        // Increment streak if it's a new day and not a "NO" verdict
        newStreak = (user.currentStreak || 0) + 1;
      }
    } else if (verdict === "NO") {
      // Reset streak even on same day if "NO" verdict
      newStreak = 0;
    }
    
    const newLongestStreak = Math.max(user.longestStreak || 0, newStreak);
    
    const [updatedUser] = await db
      .update(users)
      .set({ 
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastStreakDate: today,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    
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
    const now = new Date();
    return new Date(now.toLocaleString("en-US", { timeZone: "Europe/Madrid" }));
  }
}

export const storage = new DatabaseStorage();
