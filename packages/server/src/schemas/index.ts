import { relations } from "drizzle-orm";
import { sources } from "./sources";
import { runs } from "./runs";
import { datalake } from "./datalake";
import { datawarehouse } from "./datawarehouse";
import { files } from "./files";
import { fileReferences } from "./file-references";

export { sources } from "./sources";
export { runs, type RunType, type RunStatus } from "./runs";
export { datalake } from "./datalake";
export { datawarehouse } from "./datawarehouse";
export { datawarehouseTombstones } from "./datawarehouse-tombstones";
export { files } from "./files";
export { fileReferences } from "./file-references";

export const sourcesRelations = relations(sources, ({ many }) => ({
  datalakeRecords: many(datalake),
}));

export const runsRelations = relations(runs, ({ many }) => ({
  datalakeRecords: many(datalake),
  datawarehouseRecords: many(datawarehouse),
}));

export const datalakeRelations = relations(datalake, ({ one, many }) => ({
  run: one(runs, {
    fields: [datalake.runId],
    references: [runs.id],
  }),
  source: one(sources, {
    fields: [datalake.sourceId],
    references: [sources.id],
  }),
  datawarehouseRecords: many(datawarehouse),
  fileReferences: many(fileReferences),
}));

export const datawarehouseRelations = relations(datawarehouse, ({ one }) => ({
  run: one(runs, {
    fields: [datawarehouse.runId],
    references: [runs.id],
  }),
  datalakeRecord: one(datalake, {
    fields: [datawarehouse.datalakeId],
    references: [datalake.id],
  }),
}));

export const filesRelations = relations(files, ({ many }) => ({
  references: many(fileReferences),
}));

export const fileReferencesRelations = relations(fileReferences, ({ one }) => ({
  file: one(files, {
    fields: [fileReferences.fileId],
    references: [files.id],
  }),
  datalakeRecord: one(datalake, {
    fields: [fileReferences.datalakeId],
    references: [datalake.id],
  }),
  datawarehouseRecord: one(datawarehouse, {
    fields: [fileReferences.datawarehouseId],
    references: [datawarehouse.id],
  }),
}));
