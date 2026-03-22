import { relations } from "drizzle-orm";
import { sources } from "./sources";
import { runs } from "./runs";
import { bronzeRecords } from "./bronze-records";
import { goldRecords } from "./gold-records";

export { sources } from "./sources";
export { runs, type RunType, type RunStatus } from "./runs";
export { bronzeRecords } from "./bronze-records";
export { goldRecords } from "./gold-records";
export { files } from "./files";

// Relations (defined here to avoid circular imports across schema files)
export const sourcesRelations = relations(sources, ({ many }) => ({
  bronzeRecords: many(bronzeRecords),
}));

export const bronzeRecordsRelations = relations(
  bronzeRecords,
  ({ one, many }) => ({
    run: one(runs, { fields: [bronzeRecords.runId], references: [runs.id] }),
    source: one(sources, {
      fields: [bronzeRecords.sourceId],
      references: [sources.id],
    }),
    goldRecords: many(goldRecords),
  }),
);

export const runsRelations = relations(runs, ({ many }) => ({
  bronzeRecords: many(bronzeRecords),
  goldRecords: many(goldRecords),
}));

export const goldRecordsRelations = relations(goldRecords, ({ one }) => ({
  run: one(runs, {
    fields: [goldRecords.runId],
    references: [runs.id],
  }),
  bronzeRecord: one(bronzeRecords, {
    fields: [goldRecords.bronzeRecordId],
    references: [bronzeRecords.id],
  }),
}));
