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
  if (!record) {
    throw new Error(`Datalake record not found: ${params.id}`);
  }
  return record;
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
  items: { key: string; data: unknown }[];
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
          },
        })
        .returning();
    } catch (err) {
      // #region agent log
      const e = err as Error & { cause?: unknown };
      fetch("http://127.0.0.1:7709/ingest/15fa5519-9483-4cbf-af55-01b271e12fe1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "9a0798",
        },
        body: JSON.stringify({
          sessionId: "9a0798",
          hypothesisId: "H2",
          location: "datalake.service.ts:saveDatalakeRecords:insertCatch",
          message: "datalake insert failed",
          data: {
            errMessage: e?.message,
            errCause:
              e?.cause != null && typeof e.cause === "object" && "message" in e.cause
                ? String((e.cause as Error).message)
                : e?.cause != null
                  ? String(e.cause)
                  : null,
            valueCount: values.length,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
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
