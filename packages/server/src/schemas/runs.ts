import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export type RunType = "extract" | "transform";
export type RunStatus = "running" | "completed" | "failed";

export const runs = pgTable("runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: text("type").$type<RunType>().notNull(),
  status: text("status").$type<RunStatus>().notNull(),
  error: text("error"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});
