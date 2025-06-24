import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  
  // Authentication providers
  authProvider: varchar("auth_provider").default("replit"), // replit, google, apple, email
  passwordHash: varchar("password_hash"), // for email/password auth
  passwordResetToken: varchar("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  googleId: varchar("google_id"),
  appleId: varchar("apple_id"),
  
  // Subscription
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionTier: varchar("subscription_tier").default("free"), // free, pro, advanced
  subscriptionStatus: varchar("subscription_status").default("inactive"), // active, inactive, cancelled
  
  // User preferences and onboarding
  onboardingCompleted: boolean("onboarding_completed").default(false),
  dietaryPreferences: jsonb("dietary_preferences"),
  healthGoals: jsonb("health_goals"),
  medicalConditions: jsonb("medical_conditions"),
  allergies: jsonb("allergies"),
  
  // Gamification and Progress
  calorieGoal: integer("calorie_goal").default(2000), // Daily calorie goal
  currentStreak: integer("current_streak").default(0), // Days without "NO" food
  longestStreak: integer("longest_streak").default(0), // Best streak record
  totalPoints: integer("total_points").default(0), // Lifetime total points for level calculation
  currentLevel: integer("current_level").default(1), // User level (1000 points per level)
  lastStreakDate: timestamp("last_streak_date"), // Last date streak was updated
  
  // GDPR and Privacy
  gdprConsent: jsonb("gdpr_consent"), // stores consent details and timestamps
  gdprBannerShown: boolean("gdpr_banner_shown").default(false), // tracks if initial GDPR banner was shown
  hasSeenPrivacyBanner: boolean("has_seen_privacy_banner").default(false), // tracks if user has seen privacy banner
  privacySettings: jsonb("privacy_settings").default({
    showCalorieCounter: true,
    participateInWeeklyChallenge: true,
    showFoodStats: true,
    showNutritionDetails: true
  }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_users_email").on(table.email),
  index("idx_users_google_id").on(table.googleId),
  index("idx_users_stripe_subscription").on(table.stripeSubscriptionId),
  index("idx_users_subscription_tier").on(table.subscriptionTier),
  index("idx_users_password_reset").on(table.passwordResetToken)
]);

// Food analysis logs
export const foodLogs = pgTable("food_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  foodName: text("food_name").notNull(),
  imageUrl: text("image_url"),
  verdict: varchar("verdict").notNull(), // YES, NO, OK
  explanation: text("explanation").notNull(),
  calories: integer("calories"),
  protein: integer("protein"),
  carbohydrates: integer("carbohydrates"),
  fat: integer("fat"),
  fiber: integer("fiber"),
  sugar: integer("sugar"),
  sodium: integer("sodium"),
  confidence: integer("confidence").notNull(),
  portion: varchar("portion"),
  analysisMethod: varchar("analysis_method").notNull(), // ai, fallback, manual
  isLogged: boolean("is_logged").default(false), // true if user clicked "Yum", false if just analyzed
  nutritionFacts: jsonb("nutrition_facts"),
  alternatives: jsonb("alternatives"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_food_logs_user_created").on(table.userId, table.createdAt),
  index("idx_food_logs_user_logged").on(table.userId, table.isLogged),
  index("idx_food_logs_created_at").on(table.createdAt)
]);

// Weekly leaderboard - tracks points earned THIS WEEK only
export const weeklyScores = pgTable("weekly_scores", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  weekStart: timestamp("week_start").notNull(),
  yesCount: integer("yes_count").default(0),
  noCount: integer("no_count").default(0),
  okCount: integer("ok_count").default(0),
  weeklyPoints: integer("weekly_points").default(0), // Points earned THIS WEEK (food + bonuses)
  rank: integer("rank"),
}, (table) => [
  index("idx_weekly_scores_user_week").on(table.userId, table.weekStart),
  index("idx_weekly_scores_points").on(table.weeklyPoints),
  index("idx_weekly_scores_week_start").on(table.weekStart)
]);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  foodLogs: many(foodLogs),
  weeklyScores: many(weeklyScores),
}));

export const foodLogsRelations = relations(foodLogs, ({ one }) => ({
  user: one(users, {
    fields: [foodLogs.userId],
    references: [users.id],
  }),
}));

export const weeklyScoresRelations = relations(weeklyScores, ({ one }) => ({
  user: one(users, {
    fields: [weeklyScores.userId],
    references: [users.id],
  }),
}));

// Zod schemas
export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertFoodLogSchema = createInsertSchema(foodLogs).omit({
  id: true,
  createdAt: true,
});

export const updateUserProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  dietaryPreferences: z.array(z.string()).optional(),
  healthGoals: z.array(z.string()).optional(),
  medicalConditions: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  calorieGoal: z.number().min(800, "Minimum 800 calories").max(5000, "Maximum 5000 calories").optional(),
  privacySettings: z.object({
    shareDataForResearch: z.boolean(),
    allowMarketing: z.boolean(),
    shareWithHealthProviders: z.boolean(),
    showCalorieCounter: z.boolean(),
    participateInWeeklyChallenge: z.boolean(),
    showFoodStats: z.boolean(),
    showNutritionDetails: z.boolean(),
  }).optional(),
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertFoodLog = z.infer<typeof insertFoodLogSchema>;
export type FoodLog = typeof foodLogs.$inferSelect;
export type WeeklyScore = typeof weeklyScores.$inferSelect;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
