import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { runs } from "./runs";
import { sources } from "./sources";
import { superjsonb } from "./superjsonb";

export const datalake = pgTable("datalake", {
  id: uuid("id").defaultRandom().primaryKey(),
  runId: uuid("run_id")
    .notNull()
    .references(() => runs.id, { onDelete: "cascade" }),
  sourceId: uuid("source_id")
    .notNull()
    .references(() => sources.id, { onDelete: "cascade" }),
  extractorId: text("extractor_id").notNull(),
  key: text("key").notNull().unique(),
  data: superjsonb("data").$type<any>().notNull(),
  metadata: superjsonb("metadata")
    .$type<Record<string, any>>()
    .notNull()
    .default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
