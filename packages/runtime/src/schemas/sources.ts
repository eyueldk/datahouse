import {
  pgTable,
  text,
  timestamp,
  varchar,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

export const sources = pgTable(
  "sources",
  {
    id: varchar("id")
      .$defaultFn(() => `src_${nanoid()}`)
      .primaryKey(),
    extractorId: text("extractor_id").notNull(),
    key: text("key").notNull(),
    config: jsonb("config"),
    cursor: jsonb("cursor"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique("sources_extractor_id_key_unq").on(t.extractorId, t.key)],
);
