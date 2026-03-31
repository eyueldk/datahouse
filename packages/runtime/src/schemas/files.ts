import {
  pgTable,
  text,
  timestamp,
  varchar,
  integer,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { datalake } from "./datalake";
import { datawarehouse } from "./datawarehouse";

export const files = pgTable(
  "files",
  {
    id: varchar("id")
      .$defaultFn(() => `file_${nanoid()}`)
      .primaryKey(),
    key: text("key").notNull().unique(),
    name: text("name").notNull(),
    mimeType: text("mime_type"),
    size: integer("size"),
    checksum: text("checksum").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    datalakeId: varchar("datalake_id").references(() => datalake.id, {
      onDelete: "set null",
    }),
    datawarehouseId: varchar("datawarehouse_id").references(
      () => datawarehouse.id,
      { onDelete: "set null" },
    ),
  },
  (t) => [
    check(
      "files_one_record_kind",
      sql`(${t.datalakeId} IS NULL) OR (${t.datawarehouseId} IS NULL)`,
    ),
  ],
);
