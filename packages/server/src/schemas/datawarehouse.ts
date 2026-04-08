import {
  pgTable,
  text,
  timestamp,
  varchar,
  unique,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { runs } from "./runs";
import { datalake } from "./datalake";
import { superjsonb } from "./superjsonb";

export const datawarehouse = pgTable(
  "datawarehouse",
  {
    id: varchar("id")
      .$defaultFn(() => `dwh_${nanoid()}`)
      .primaryKey(),
    runId: varchar("run_id")
      .notNull()
      .references(() => runs.id, { onDelete: "cascade" }),
    datalakeId: varchar("datalake_id")
      .notNull()
      .references(() => datalake.id, { onDelete: "cascade" }),
    transformerId: text("transformer_id").notNull(),
    collection: text("collection").notNull(),
    key: text("key").notNull(),
    data: superjsonb("data").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    unique("datawarehouse_collection_key_unq").on(t.collection, t.key),
  ],
);
