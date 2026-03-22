import { pgTable, text, timestamp, varchar, unique } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { runs } from "./runs";
import { bronzeRecords } from "./bronze-records";
import { superjsonType } from "./superjson-type";

export const goldRecords = pgTable(
  "gold_records",
  {
    id: varchar("id")
      .$defaultFn(() => `gld_${nanoid()}`)
      .primaryKey(),
    runId: varchar("run_id")
      .references(() => runs.id, { onDelete: "cascade" })
      .notNull(),
    bronzeRecordId: varchar("bronze_record_id")
      .references(() => bronzeRecords.id, { onDelete: "cascade" })
      .notNull(),
    transformerId: text("transformer_id").notNull(),
    collection: text("collection").notNull(),
    key: text("key").notNull(),
    data: superjsonType("data").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique("gold_record_collection_key_unq").on(t.collection, t.key)],
);
