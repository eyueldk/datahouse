import {
  pgTable,
  text,
  timestamp,
  varchar,
  primaryKey,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { runs } from "./runs";
import { bronzeRecords } from "./bronze-records";
import { superjsonb } from "./superjsonb";

export const goldRecords = pgTable(
  "gold_records",
  {
    runId: varchar("run_id")
      .notNull()
      .references(() => runs.id),
    bronzeRecordId: varchar("bronze_record_id")
      .notNull()
      .references(() => bronzeRecords.id),
    transformerId: text("transformer_id").notNull(),
    collection: text("collection").notNull(),
    key: text("key").notNull(),
    data: superjsonb("data").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    id: varchar("id").$defaultFn(() => `gld_${nanoid()}`),
  },
  (t) => [primaryKey({ columns: [t.runId, t.bronzeRecordId, t.transformerId] })],
);
