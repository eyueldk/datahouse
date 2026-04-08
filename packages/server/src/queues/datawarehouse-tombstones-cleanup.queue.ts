import { queueBackend } from "../configs/queue.config";
import { purgeExpiredDatawarehouseTombstones } from "../services/datawarehouse.service";

export type DatawarehouseTombstonesCleanupQueueData = Record<string, never>;

export interface DatawarehouseTombstonesCleanupQueueResult {
  purged: true;
}

export const datawarehouseTombstonesCleanupQueue = queueBackend.register<
  DatawarehouseTombstonesCleanupQueueData,
  DatawarehouseTombstonesCleanupQueueResult
>({
  name: "datawarehouse-tombstones-cleanup",
  execute: async () => {
    await purgeExpiredDatawarehouseTombstones();
    return { purged: true };
  },
});
