import {
  pgTable,
  text,
  timestamp,
  varchar,
  integer,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

export const files = pgTable("files", {
  id: varchar("id")
    .$defaultFn(() => `file_${nanoid()}`)
    .primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  mimeType: text("mime_type"),
  size: integer("size"),
  checksum: text("checksum").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
