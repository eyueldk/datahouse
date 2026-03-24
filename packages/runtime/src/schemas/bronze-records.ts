import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { runs } from "./runs";
import { sources } from "./sources";
import { superjsonb } from "./superjsonb";

export const bronzeRecords = pgTable("bronze_records", {
  id: varchar("id")
    .$defaultFn(() => `brz_${nanoid()}`)
    .primaryKey(),
  runId: varchar("run_id")
    .notNull()
    .references(() => runs.id),
  sourceId: varchar("source_id")
    .notNull()
    .references(() => sources.id),
  key: text("key").notNull(),
  data: superjsonb("data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
