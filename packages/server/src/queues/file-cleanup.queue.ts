import { and, eq, lt, notExists } from "drizzle-orm";
import { queueBackend } from "../configs/queue.config";
import { dbBackend } from "../configs/database.config";
import { fileReferences } from "../schemas/file-references";
import { files } from "../schemas/files";
import { deleteFile } from "../services/files.service";

const { db } = dbBackend;

const ORPHAN_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export type FileCleanupQueueData = Record<string, never>;

export interface FileCleanupQueueResult {
  deleted: number;
}

export const fileCleanupQueue = queueBackend.register<
  FileCleanupQueueData,
  FileCleanupQueueResult
>({
  name: "file-cleanup",
  execute: async () => {
    const cutoff = new Date(Date.now() - ORPHAN_MAX_AGE_MS);
    const candidates = await db
      .select({ id: files.id })
      .from(files)
      .where(
        and(
          notExists(
            db
              .select({ id: fileReferences.id })
              .from(fileReferences)
              .where(eq(fileReferences.fileId, files.id)),
          ),
          lt(files.createdAt, cutoff),
        ),
      );

    for (const row of candidates) {
      await deleteFile({ id: row.id });
    }

    return { deleted: candidates.length };
  },
});
