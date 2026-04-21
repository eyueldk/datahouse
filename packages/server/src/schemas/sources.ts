import {
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { superjsonb } from "./superjsonb";

export const sources = pgTable(
  "sources",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    extractorId: text("extractor_id").notNull(),
    key: text("key").notNull(),
    config: superjsonb("config"),
    cursor: superjsonb("cursor"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique("sources_extractor_id_key_unq").on(t.extractorId, t.key)],
);
