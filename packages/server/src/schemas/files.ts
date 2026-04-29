import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/** File blob metadata and storage key. */
export const files = pgTable("files", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  mimeType: text("mime_type"),
  size: integer("size"),
  checksum: text("checksum").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
