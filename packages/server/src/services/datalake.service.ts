import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { dbBackend } from "../configs/database.config";
import { datalake } from "../schemas/datalake";
import { syncFileLinks } from "./files.service";

const { db } = dbBackend;

export async function listDatalakeRecordsForExtractRun(params: {
  runId: string;
}) {
  return db
    .select({
      id: datalake.id,
      sourceId: datalake.sourceId,
      extractorId: datalake.extractorId,
      key: datalake.key,
    })
    .from(datalake)
    .where(eq(datalake.runId, params.runId));
}

export async function paginateDatalakeRecords(params: {
  extractorId?: string;
  sourceId?: string;
  since?: Date;
  limit: number;
  offset: number;
}) {
  const limit = Math.max(1, params.limit);
  const offset = Math.max(0, params.offset);

  let itemsQuery = db
    .select()
    .from(datalake)
    .orderBy(datalake.createdAt)
    .$dynamic();
  let countQuery = db
    .select({ total: sql<number>`count(*)` })
    .from(datalake)
    .$dynamic();
  const filters = [];
  if (params.extractorId) {
    filters.push(eq(datalake.extractorId, params.extractorId));
  }
  if (params.sourceId) {
    filters.push(eq(datalake.sourceId, params.sourceId));
  }
  if (params.since) {
    filters.push(gte(datalake.createdAt, params.since));
  }
  if (filters.length > 0) {
    const combined = and(...filters);
    itemsQuery = itemsQuery.where(combined);
    countQuery = countQuery.where(combined);
  }
  const [items, countResult] = await Promise.all([
    itemsQuery.limit(limit).offset(offset),
    countQuery,
  ]);
  return {
    items,
    total: Number(countResult[0]?.total ?? 0),
  };
}

export async function findDatalakeRecord(params: { id: string }) {
  const [record] = await db
    .select()
    .from(datalake)
    .where(eq(datalake.id, params.id))
    .limit(1);
  return record ?? null;
}

export async function saveDatalakeRecords({
  runId,
  sourceId,
  extractorId,
  items,
}: {
  runId: string;
  sourceId: string;
  extractorId: string;
  items: { key: string; data: unknown; metadata?: Record<string, any> }[];
}): Promise<{ id: string }[]> {
  if (items.length === 0) return [];

  const keys = [...new Set(items.map((item) => item.key))];
  const existingRecords =
    keys.length > 0
      ? await db
          .select({ key: datalake.key, data: datalake.data })
          .from(datalake)
          .where(inArray(datalake.key, keys))
      : [];
  const previousByKey = new Map(
    existingRecords.map((rec) => [rec.key, rec.data]),
  );

  const values = items.map((item) => ({
    runId,
    sourceId,
    extractorId,
    key: item.key,
    data: item.data,
    metadata: item.metadata ?? {},
  }));

  const returned = await (async () => {
    try {
      return await db
        .insert(datalake)
        .values(values)
        .onConflictDoUpdate({
          target: datalake.key,
          set: {
            runId: sql`excluded.${sql.identifier(datalake.runId.name)}`,
            sourceId: sql`excluded.${sql.identifier(datalake.sourceId.name)}`,
            extractorId: sql`excluded.${sql.identifier(datalake.extractorId.name)}`,
            data: sql`excluded.${sql.identifier(datalake.data.name)}`,
            metadata: sql`excluded.${sql.identifier(datalake.metadata.name)}`,
          },
        })
        .returning();
    } catch (err) {
      throw err;
    }
  })();

  await Promise.all(
    returned.map((rec, i) => {
      const item = items[i];
      if (!item) {
        throw new Error("saveDatalakeRecords: returning record count mismatch");
      }
      return syncFileLinks({
        kind: "datalake",
        recordId: rec.id,
        previousData: previousByKey.get(item.key),
        nextData: item.data,
      });
    }),
  );

  return returned.map((rec) => ({ id: rec.id }));
}

export async function deleteDatalakeRecord(params: { id: string }) {
  const record = await findDatalakeRecord(params);
  if (!record) return;
  await syncFileLinks({
    kind: "datalake",
    recordId: record.id,
    previousData: record.data,
    nextData: {},
  });
  await db.delete(datalake).where(eq(datalake.id, params.id));
}
