import {
  pgTable,
  text,
  timestamp,
  varchar,
  unique,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { superjsonb } from "./superjsonb";

export const sources = pgTable(
  "sources",
  {
    id: varchar("id")
      .$defaultFn(() => `src_${nanoid()}`)
      .primaryKey(),
    extractorId: text("extractor_id").notNull(),
    key: text("key").notNull(),
    config: superjsonb("config"),
    cursor: superjsonb("cursor"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique("sources_extractor_id_key_unq").on(t.extractorId, t.key)],
);
