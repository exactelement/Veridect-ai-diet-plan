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
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Profile operations
  updateUserProfile(id: string, profile: UpdateUserProfile): Promise<User>;
  completeOnboarding(id: string): Promise<User>;
  updateGdprConsent(userId: string, consent: any): Promise<User>;
  
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
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
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

  async updateGdprConsent(userId: string, consent: any): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        gdprConsent: consent,
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
  async updateWeeklyScore(userId: string, verdict: string): Promise<void> {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const existingScore = await db
      .select()
      .from(weeklyScores)
      .where(
        and(
          eq(weeklyScores.userId, userId),
          eq(weeklyScores.weekStart, startOfWeek)
        )
      );

    if (existingScore.length > 0) {
      // Update existing score
      const score = existingScore[0];
      const updates: any = {};
      
      if (verdict === "YES") updates.yesCount = (score.yesCount || 0) + 1;
      else if (verdict === "NO") updates.noCount = (score.noCount || 0) + 1;
      else if (verdict === "OK") updates.okCount = (score.okCount || 0) + 1;

      // Calculate new total score (YES=100, OK=50, NO=0)
      const newYes = updates.yesCount || score.yesCount || 0;
      const newOk = updates.okCount || score.okCount || 0;
      const newNo = updates.noCount || score.noCount || 0;
      updates.totalScore = String(newYes * 100 + newOk * 50);

      await db
        .update(weeklyScores)
        .set(updates)
        .where(eq(weeklyScores.id, score.id));
    } else {
      // Create new score
      const initialScore = {
        yesCount: verdict === "YES" ? 1 : 0,
        okCount: verdict === "OK" ? 1 : 0,
        noCount: verdict === "NO" ? 1 : 0,
      };
      
      await db
        .insert(weeklyScores)
        .values({
          userId,
          weekStart: startOfWeek,
          ...initialScore,
          totalScore: String(initialScore.yesCount * 100 + initialScore.okCount * 50),
        });
    }

    // Update ranks for all users this week
    await this.updateWeeklyRanks(startOfWeek);
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
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    return await db
      .select({
        id: weeklyScores.id,
        userId: weeklyScores.userId,
        weekStart: weeklyScores.weekStart,
        yesCount: weeklyScores.yesCount,
        noCount: weeklyScores.noCount,
        okCount: weeklyScores.okCount,
        totalScore: weeklyScores.totalScore,
        rank: weeklyScores.rank,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(weeklyScores)
      .leftJoin(users, eq(weeklyScores.userId, users.id))
      .where(eq(weeklyScores.weekStart, startOfWeek))
      .orderBy(weeklyScores.rank);
  }

  async getUserWeeklyScore(userId: string): Promise<WeeklyScore | undefined> {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

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
}

export const storage = new DatabaseStorage();
