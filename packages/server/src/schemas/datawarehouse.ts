import {
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { runs } from "./runs";
import { datalake } from "./datalake";
import { superjsonb } from "./superjsonb";

export const datawarehouse = pgTable(
  "datawarehouse",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    runId: uuid("run_id")
      .notNull()
      .references(() => runs.id, { onDelete: "cascade" }),
    datalakeId: uuid("datalake_id")
      .notNull()
      .references(() => datalake.id, { onDelete: "cascade" }),
    transformerId: text("transformer_id").notNull(),
    collection: text("collection").notNull(),
    key: text("key").notNull(),
    data: superjsonb("data").$type<any>().notNull(),
    metadata: superjsonb("metadata")
      .$type<Record<string, any>>()
      .notNull()
      .default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    unique("datawarehouse_collection_key_unq").on(t.collection, t.key),
  ],
);
