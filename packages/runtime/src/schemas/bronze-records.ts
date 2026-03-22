import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { runs } from "./runs";
import { sources } from "./sources";
import { superjsonType } from "./superjson-type";

export const bronzeRecords = pgTable("bronze_records", {
  id: varchar("id")
    .$defaultFn(() => `brz_${nanoid()}`)
    .primaryKey(),
  runId: varchar("run_id")
    .references(() => runs.id, { onDelete: "cascade" })
    .notNull(),
  sourceId: varchar("source_id")
    .references(() => sources.id, { onDelete: "cascade" })
    .notNull(),
  key: text("key").notNull().unique(),
  data: superjsonType("data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
