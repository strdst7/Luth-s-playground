import { integer, jsonb, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export type LearningSnapshot = {
  xp: number;
  lessonsCompleted: number;
  correctAnswers: number;
  totalAnswers: number;
  streak: number;
  longestStreak: number;
  badges: string[];
  subjectProgress: Record<string, { completed: number; correct: number; total: number }>;
  weeklyActivity: number[];
  lastPlayed: string;
};

export const learnerSync = pgTable(
  "learner_sync",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    deviceId: text("device_id").notNull(),
    playerName: text("player_name").notNull().default("Player"),
    avatar: text("avatar").notNull().default("🧑‍🚀"),
    version: integer("version").notNull().default(1),
    snapshot: jsonb("snapshot").$type<LearningSnapshot>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("learner_sync_device_idx").on(table.deviceId)],
);
