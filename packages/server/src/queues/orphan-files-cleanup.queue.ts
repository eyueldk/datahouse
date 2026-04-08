import { and, isNull, lt } from "drizzle-orm";
import { queueBackend } from "../configs/queue.config";
import { dbBackend } from "../configs/database.config";
import { files } from "../schemas/files";
import { deleteFile } from "../services/files.service";

const { db } = dbBackend;

const ORPHAN_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export type OrphanFilesCleanupQueueData = Record<string, never>;

export interface OrphanFilesCleanupQueueResult {
  deleted: number;
}

export const orphanFilesCleanupQueue = queueBackend.register<
  OrphanFilesCleanupQueueData,
  OrphanFilesCleanupQueueResult
>({
  name: "orphan-files-cleanup",
  execute: async () => {
    const cutoff = new Date(Date.now() - ORPHAN_MAX_AGE_MS);
    const candidates = await db
      .select({ id: files.id })
      .from(files)
      .where(
        and(
          isNull(files.datalakeId),
          isNull(files.datawarehouseId),
          lt(files.createdAt, cutoff),
        ),
      );

    for (const row of candidates) {
      await deleteFile({ id: row.id });
    }

    return { deleted: candidates.length };
  },
});
