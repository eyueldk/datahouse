import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { runs } from "./runs";
import { sources } from "./sources";
import { superjsonb } from "./superjsonb";

export const datalake = pgTable("datalake", {
  id: varchar("id")
    .$defaultFn(() => `dlk_${nanoid()}`)
    .primaryKey(),
  runId: varchar("run_id")
    .notNull()
    .references(() => runs.id, { onDelete: "cascade" }),
  sourceId: varchar("source_id")
    .notNull()
    .references(() => sources.id, { onDelete: "cascade" }),
  extractorId: text("extractor_id").notNull(),
  key: text("key").notNull().unique(),
  data: superjsonb("data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
