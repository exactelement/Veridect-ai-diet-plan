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
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionTier: varchar("subscription_tier").default("free"), // free, pro, medical
  subscriptionStatus: varchar("subscription_status").default("inactive"), // active, inactive, cancelled
  onboardingCompleted: boolean("onboarding_completed").default(false),
  dietaryPreferences: jsonb("dietary_preferences"),
  healthGoals: jsonb("health_goals"),
  medicalConditions: jsonb("medical_conditions"),
  allergies: jsonb("allergies"),
  privacySettings: jsonb("privacy_settings"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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
  nutritionFacts: jsonb("nutrition_facts"),
  alternatives: jsonb("alternatives"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Weekly leaderboard
export const weeklyScores = pgTable("weekly_scores", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  weekStart: timestamp("week_start").notNull(),
  yesCount: integer("yes_count").default(0),
  noCount: integer("no_count").default(0),
  okCount: integer("ok_count").default(0),
  totalScore: decimal("total_score").default("0"),
  rank: integer("rank"),
});

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

export const updateUserProfileSchema = createInsertSchema(users).pick({
  firstName: true,
  lastName: true,
  dietaryPreferences: true,
  healthGoals: true,
  medicalConditions: true,
  allergies: true,
  privacySettings: true,
}).extend({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
}).partial();

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertFoodLog = z.infer<typeof insertFoodLogSchema>;
export type FoodLog = typeof foodLogs.$inferSelect;
export type WeeklyScore = typeof weeklyScores.$inferSelect;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
