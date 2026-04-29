import { UploadedFile } from "@datahousejs/core";
import { nanoid } from "nanoid";
import { and, eq, inArray, isNotNull, isNull, or, sql } from "drizzle-orm";
import { dbBackend } from "../configs/database.config";
import { filesBackend } from "../configs/files.config";
import { datalake } from "../schemas/datalake";
import { fileReferences } from "../schemas/file-references";
import { files } from "../schemas/files";
import { datawarehouse } from "../schemas/datawarehouse";
import { diffUploadedFiles } from "../utils/diff-uploaded-files";

const { db } = dbBackend;

export type RecordFileKind = "datalake" | "datawarehouse";

/** Syncs file reference rows to match `UploadedFile` refs for this record. */
export async function syncFileLinks(params: {
  kind: RecordFileKind;
  recordId: string;
  nextData: unknown;
  previousData?: unknown;
}) {
  const { kind, recordId, previousData } = params;

  const table = kind === "datalake" ? datalake : datawarehouse;
  const [record] = await db
    .select({ id: table.id })
    .from(table)
    .where(eq(table.id, recordId))
    .limit(1);
  if (!record) {
    throw new Error(`Record not found: ${recordId}`);
  }

  const { added, removed } = diffUploadedFiles({
    initialData: previousData,
    finalData: params.nextData,
  });

  for (const file of removed) {
    await db.delete(fileReferences).where(
      and(
        eq(fileReferences.fileId, file.id),
        kind === "datalake"
          ? eq(fileReferences.datalakeId, recordId)
          : eq(fileReferences.datawarehouseId, recordId),
      ),
    );
  }

  for (const file of added) {
    await db
      .insert(fileReferences)
      .values(
        kind === "datalake"
          ? { fileId: file.id, datalakeId: recordId }
          : { fileId: file.id, datawarehouseId: recordId },
      )
      .onConflictDoNothing();
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

export async function findUploadedFile(params: { id: string }) {
  const [record] = await db
    .select()
    .from(files)
    .where(eq(files.id, params.id))
    .limit(1);
  if (!record) {
    return undefined;
  }
  return new UploadedFile({
    id: record.id,
    name: record.name,
    mimeType: record.mimeType,
    size: record.size,
    createdAt: record.createdAt,
  });
}

export async function downloadFile(params: { id: string }) {
  const [record] = await db
    .select({ key: files.key })
    .from(files)
    .where(eq(files.id, params.id))
    .limit(1);
  if (!record) {
    return undefined;
  }
  return filesBackend.read(record.key);
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

export type FileListRow = typeof files.$inferSelect;
export type FileReferenceRow = typeof fileReferences.$inferSelect;
export type FileListReference = {
  id: string;
  fileId: string;
  kind: RecordFileKind;
  recordId: string;
  createdAt: Date;
};

function toFileListReference(reference: FileReferenceRow): FileListReference {
  if (reference.datalakeId) {
    return {
      id: reference.id,
      fileId: reference.fileId,
      kind: "datalake",
      recordId: reference.datalakeId,
      createdAt: reference.createdAt,
    };
  }
  if (reference.datawarehouseId) {
    return {
      id: reference.id,
      fileId: reference.fileId,
      kind: "datawarehouse",
      recordId: reference.datawarehouseId,
      createdAt: reference.createdAt,
    };
  }
  throw new Error(`Invalid file reference: ${reference.id}`);
}

function referenceFilters(params: {
  kind?: RecordFileKind;
  recordId?: string;
}) {
  const filters = [isNotNull(fileReferences.id)];
  if (params.kind === "datalake") {
    filters.push(isNull(fileReferences.datawarehouseId));
    if (params.recordId) {
      filters.push(eq(fileReferences.datalakeId, params.recordId));
    }
  } else if (params.kind === "datawarehouse") {
    filters.push(isNull(fileReferences.datalakeId));
    if (params.recordId) {
      filters.push(eq(fileReferences.datawarehouseId, params.recordId));
    }
  } else if (params.recordId) {
    filters.push(
      or(
        eq(fileReferences.datalakeId, params.recordId),
        eq(fileReferences.datawarehouseId, params.recordId),
      )!,
    );
  }
  return and(...filters)!;
}

export async function paginateFiles(params: {
  kind?: RecordFileKind;
  recordId?: string;
  limit: number;
  offset: number;
}): Promise<{
  items: (FileListRow & { references: FileListReference[] })[];
  total: number;
}> {
  const limit = Math.max(1, params.limit);
  const offset = Math.max(0, params.offset);
  const whereClause = referenceFilters(params);
  const [rows, countResult] = await Promise.all([
    db
      .selectDistinct({ file: files })
      .from(files)
      .leftJoin(fileReferences, eq(fileReferences.fileId, files.id))
      .where(whereClause)
      .orderBy(files.createdAt)
      .limit(limit)
      .offset(offset),
    db
      .select({
        total: sql<number>`count(distinct ${files.id})`,
      })
      .from(files)
      .leftJoin(fileReferences, eq(fileReferences.fileId, files.id))
      .where(whereClause),
  ]);
  const fileIds = rows.map((row) => row.file.id);
  const references =
    fileIds.length === 0
      ? []
      : await db
          .select()
          .from(fileReferences)
          .where(inArray(fileReferences.fileId, fileIds));
  const referencesByFileId = new Map<string, FileReferenceRow[]>();
  for (const reference of references) {
    const existing = referencesByFileId.get(reference.fileId);
    if (existing) {
      existing.push(reference);
    } else {
      referencesByFileId.set(reference.fileId, [reference]);
    }
  }
  return {
    items: rows.map((row) => ({
      ...row.file,
      references: (referencesByFileId.get(row.file.id) ?? []).map(
        toFileListReference,
      ),
    })),
    total: countResult[0]?.total ?? 0,
  };
}

