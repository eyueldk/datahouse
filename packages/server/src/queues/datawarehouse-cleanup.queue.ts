import { lt } from "drizzle-orm";
import { queueBackend } from "../configs/queue.config";
import { dbBackend } from "../configs/database.config";
import { datawarehouseTombstones } from "../schemas/datawarehouse-tombstones";

const { db } = dbBackend;

const TOMBSTONE_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

export type DatawarehouseCleanupQueueData = Record<string, never>;

export interface DatawarehouseCleanupQueueResult {
  purged: true;
}

export const datawarehouseCleanupQueue = queueBackend.register<
  DatawarehouseCleanupQueueData,
  DatawarehouseCleanupQueueResult
>({
  name: "datawarehouse-cleanup",
  execute: async () => {
    const cutoff = new Date(Date.now() - TOMBSTONE_RETENTION_MS);
    await db
      .delete(datawarehouseTombstones)
      .where(lt(datawarehouseTombstones.deletedAt, cutoff));
    return { purged: true };
  },
});
