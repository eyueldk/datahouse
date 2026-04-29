import {
  pgTable,
  uniqueIndex,
  uuid,
  timestamp,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { datalake } from "./datalake";
import { datawarehouse } from "./datawarehouse";
import { files } from "./files";

export const fileReferences = pgTable(
  "file_references",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fileId: uuid("file_id")
      .notNull()
      .references(() => files.id, { onDelete: "cascade" }),
    datalakeId: uuid("datalake_id").references(() => datalake.id, {
      onDelete: "cascade",
    }),
    datawarehouseId: uuid("datawarehouse_id").references(
      () => datawarehouse.id,
      { onDelete: "cascade" },
    ),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("file_refs_file_datalake_unq").on(table.fileId, table.datalakeId),
    uniqueIndex("file_refs_file_datawarehouse_unq").on(
      table.fileId,
      table.datawarehouseId,
    ),
    check(
      "file_refs_kind_check",
      sql`(
        (${table.datalakeId} is not null and ${table.datawarehouseId} is null) or
        (${table.datalakeId} is null and ${table.datawarehouseId} is not null)
      )`,
    ),
  ],
);
