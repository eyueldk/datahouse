import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

export type RunType = "extract" | "transform";
export type RunStatus = "running" | "completed" | "failed";

export const runs = pgTable("runs", {
  id: varchar("id")
    .$defaultFn(() => `run_${nanoid()}`)
    .primaryKey(),
  type: text("type").$type<RunType>().notNull(),
  status: text("status").$type<RunStatus>().notNull(),
  error: text("error"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});
