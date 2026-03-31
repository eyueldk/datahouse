import { pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";

/** Removal notifications for datawarehouse keys (~7d retention; then purged). */
export const datawarehouseTombstones = pgTable(
  "datawarehouse_tombstones",
  {
    collection: text("collection").notNull(),
    key: text("key").notNull(),
    deletedAt: timestamp("deleted_at").defaultNow().notNull(),
  },
  (t) => [
    unique("datawarehouse_tombstones_collection_key_unq").on(
      t.collection,
      t.key,
    ),
  ],
);
