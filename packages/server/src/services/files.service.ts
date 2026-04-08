import { nanoid } from "nanoid";
import { and, eq } from "drizzle-orm";
import { dbBackend } from "../configs/database.config";
import { filesBackend } from "../configs/files.config";
import { collectUploadedFiles } from "../lib/collect-uploaded-files";
import { datalake } from "../schemas/datalake";
import { files } from "../schemas/files";
import { datawarehouse } from "../schemas/datawarehouse";

const { db } = dbBackend;

export type RecordFileKind = "datalake" | "datawarehouse";

/**
 * Syncs `files` rows to match `UploadedFile` refs in `nextData` vs `previousData` for this record.
 */
export async function syncFileLinks(params: {
  kind: RecordFileKind;
  recordId: string;
  nextData: unknown;
  previousData?: unknown;
}) {
  const { kind, recordId, nextData, previousData } = params;

  const table = kind === "datalake" ? datalake : datawarehouse;
  const [record] = await db
    .select({ id: table.id })
    .from(table)
    .where(eq(table.id, recordId))
    .limit(1);
  if (!record) {
    throw new Error(`Record not found: ${recordId}`);
  }

  const nextFiles = collectUploadedFiles(nextData);
  const prevFiles =
    previousData !== undefined ? collectUploadedFiles(previousData) : [];

  const nextIds = new Set(nextFiles.map((f) => f.id));
  const prevIds = new Set(prevFiles.map((f) => f.id));

  for (const id of prevIds) {
    if (nextIds.has(id)) continue;
    if (kind === "datalake") {
      await db
        .update(files)
        .set({ datalakeId: null })
        .where(and(eq(files.id, id), eq(files.datalakeId, recordId)));
    } else {
      await db
        .update(files)
        .set({ datawarehouseId: null })
        .where(
          and(eq(files.id, id), eq(files.datawarehouseId, recordId)),
        );
    }
  }

  for (const file of nextFiles) {
    const [row] = await db
      .select()
      .from(files)
      .where(eq(files.id, file.id))
      .limit(1);
    if (!row) {
      throw new Error(`File row missing: ${file.id}`);
    }
    await db
      .update(files)
      .set(
        kind === "datalake"
          ? { datalakeId: recordId, datawarehouseId: null }
          : { datawarehouseId: recordId, datalakeId: null },
      )
      .where(eq(files.id, file.id));
  }
}

async function sha256Hex(buffer: Buffer): Promise<string> {
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(buffer);
  return hasher.digest("hex");
}

export async function uploadFile(params: {
  content: Buffer;
  name?: string;
  mimeType?: string;
}) {
  const key = nanoid();
  const checksum = await sha256Hex(params.content);

  await filesBackend.write(key, params.content, {
    mimeType: params.mimeType ?? "application/octet-stream",
  });

  const [record] = await db
    .insert(files)
    .values({
      key,
      name: params.name ?? key,
      mimeType: params.mimeType,
      size: params.content.byteLength,
      checksum,
    })
    .returning();
  return record;
}

export async function downloadFile(params: { id: string }) {
  const [record] = await db
    .select()
    .from(files)
    .where(eq(files.id, params.id))
    .limit(1);
  if (!record) {
    throw new Error(`File not found: ${params.id}`);
  }
  const content = await filesBackend.read(record.key);
  return { record, content };
}

export async function deleteFile(params: { id: string }) {
  const [deletedFile] = await db
    .delete(files)
    .where(eq(files.id, params.id))
    .returning();
  if (!deletedFile) {
    return;
  }
  await filesBackend.delete(deletedFile.key);
}
