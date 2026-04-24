import { and, eq, gte, lt, or, sql } from "drizzle-orm";
import { dbBackend } from "../configs/database.config";
import { datawarehouse } from "../schemas/datawarehouse";
import { datawarehouseTombstones } from "../schemas/datawarehouse-tombstones";
import { syncFileLinks } from "./files.service";

const { db } = dbBackend;

const TOMBSTONE_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

export async function purgeExpiredDatawarehouseTombstones() {
  const cutoff = new Date(Date.now() - TOMBSTONE_RETENTION_MS);
  await db.delete(datawarehouseTombstones).where(lt(datawarehouseTombstones.deletedAt, cutoff));
}

async function upsertDatawarehouseTombstones(
  rows: { collection: string; key: string }[],
) {
  if (rows.length === 0) return;
  const now = new Date();
  await db
    .insert(datawarehouseTombstones)
    .values(rows.map((r) => ({ ...r, deletedAt: now })))
    .onConflictDoUpdate({
      target: [datawarehouseTombstones.collection, datawarehouseTombstones.key],
      set: { deletedAt: sql`now()` },
    });
}

async function removeDatawarehouseTombstonesForLiveKeys(
  rows: { collection: string; key: string }[],
) {
  if (rows.length === 0) return;
  const conditions = rows.map((r) =>
    and(
      eq(datawarehouseTombstones.collection, r.collection),
      eq(datawarehouseTombstones.key, r.key),
    ),
  );
  await db.delete(datawarehouseTombstones).where(or(...conditions));
}

/**
 * Removes all datawarehouse records produced by a given transformer for a datalake record,
 * detaching linked files first. Call before re-running a transform on the same pair.
 */
export async function deleteDatawarehouseRecordsForDatalakeTransformer(params: {
  datalakeId: string;
  transformerId: string;
}) {
  const records = await db
    .select({
      id: datawarehouse.id,
      collection: datawarehouse.collection,
      key: datawarehouse.key,
      data: datawarehouse.data,
    })
    .from(datawarehouse)
    .where(
      and(
        eq(datawarehouse.datalakeId, params.datalakeId),
        eq(datawarehouse.transformerId, params.transformerId),
      ),
    );

  if (records.length > 0) {
    await upsertDatawarehouseTombstones(
      records.map((r) => ({ collection: r.collection, key: r.key })),
    );
  }

  for (const rec of records) {
    await syncFileLinks({
      kind: "datawarehouse",
      recordId: rec.id,
      previousData: rec.data,
      nextData: {},
    });
  }

  if (records.length === 0) return;

  await db
    .delete(datawarehouse)
    .where(
      and(
        eq(datawarehouse.datalakeId, params.datalakeId),
        eq(datawarehouse.transformerId, params.transformerId),
      ),
    );
}

export async function findPivotForTransformRun(params: { runId: string }) {
  const [pivot] = await db
    .select({
      transformerId: datawarehouse.transformerId,
      datalakeId: datawarehouse.datalakeId,
    })
    .from(datawarehouse)
    .where(eq(datawarehouse.runId, params.runId))
    .limit(1);
  return pivot ?? null;
}

function collectionKey(collection: string, key: string) {
  return `${collection}\0${key}`;
}

export async function saveDatawarehouseRecords({
  runId,
  datalakeId,
  transformerId,
  items,
}: {
  runId: string;
  datalakeId: string;
  transformerId: string;
  items: {
    collection: string;
    key: string;
    data: unknown;
    metadata?: Record<string, any>;
  }[];
}) {
  if (items.length === 0) return;

  const keyConditions = items.map((item) =>
    and(
      eq(datawarehouse.collection, item.collection),
      eq(datawarehouse.key, item.key),
    ),
  );
  const existingRecords =
    keyConditions.length > 0
      ? await db
          .select({
            collection: datawarehouse.collection,
            key: datawarehouse.key,
            data: datawarehouse.data,
          })
          .from(datawarehouse)
          .where(or(...keyConditions))
      : [];
  const previousByCollectionKey = new Map(
    existingRecords.map((rec) => [
      collectionKey(rec.collection, rec.key),
      rec.data,
    ]),
  );

  const values = items.map((item) => ({
    runId,
    datalakeId,
    transformerId,
    collection: item.collection,
    key: item.key,
    data: item.data,
    metadata: item.metadata ?? {},
  }));

  const returned = await db
    .insert(datawarehouse)
    .values(values)
    .onConflictDoUpdate({
      target: [datawarehouse.collection, datawarehouse.key],
      set: {
        runId: sql.raw(`excluded.${datawarehouse.runId.name}`),
        datalakeId: sql.raw(`excluded.${datawarehouse.datalakeId.name}`),
        transformerId: sql.raw(
          `excluded.${datawarehouse.transformerId.name}`,
        ),
        collection: sql.raw(`excluded.${datawarehouse.collection.name}`),
        data: sql.raw(`excluded.${datawarehouse.data.name}`),
        metadata: sql.raw(`excluded.${datawarehouse.metadata.name}`),
      },
    })
    .returning();

  await removeDatawarehouseTombstonesForLiveKeys(
    items.map((i) => ({ collection: i.collection, key: i.key })),
  );

  await Promise.all(
    returned.map((rec, i) => {
      const item = items[i];
      if (!item) {
        throw new Error(
          "saveDatawarehouseRecords: returning record count mismatch",
        );
      }
      return syncFileLinks({
        kind: "datawarehouse",
        recordId: rec.id,
        previousData: previousByCollectionKey.get(
          collectionKey(item.collection, item.key),
        ),
        nextData: item.data,
      });
    }),
  );
}

export async function paginateDatawarehouseTombstones(params: {
  collection: string;
  since?: Date | null;
  limit: number;
  offset: number;
}) {
  await purgeExpiredDatawarehouseTombstones();

  const limit = Math.min(Math.max(1, params.limit), 500);
  const offset = Math.max(0, params.offset);
  const { collection } = params;

  const filters = [eq(datawarehouseTombstones.collection, collection)];
  if (params.since) {
    filters.push(gte(datawarehouseTombstones.deletedAt, params.since));
  }
  const whereClause = and(...filters);

  const itemsQuery = db
    .select({
      key: datawarehouseTombstones.key,
      deletedAt: datawarehouseTombstones.deletedAt,
    })
    .from(datawarehouseTombstones)
    .where(whereClause)
    .orderBy(
      datawarehouseTombstones.deletedAt,
      datawarehouseTombstones.key,
    )
    .limit(limit)
    .offset(offset);

  const countQuery = db
    .select({ total: sql<number>`count(*)` })
    .from(datawarehouseTombstones)
    .where(whereClause);

  const [rows, countResult] = await Promise.all([itemsQuery, countQuery]);

  return {
    items: rows.map((r) => ({
      key: r.key,
      deletedAt: r.deletedAt,
    })),
    meta: {
      offset,
      limit,
      total: Number(countResult[0]?.total ?? 0),
    },
  };
}

/** Distinct `collection` values in live rows and tombstones (for UIs like Studio). */
export async function listDatawarehouseCollectionIds(): Promise<string[]> {
  const [live, tomb] = await Promise.all([
    db
      .selectDistinct({ collection: datawarehouse.collection })
      .from(datawarehouse),
    db
      .selectDistinct({ collection: datawarehouseTombstones.collection })
      .from(datawarehouseTombstones),
  ]);
  const ids = new Set<string>();
  for (const r of live) ids.add(r.collection);
  for (const r of tomb) ids.add(r.collection);
  return [...ids].sort((a, b) => a.localeCompare(b));
}

export async function paginateDatawarehouseRecords(params: {
  collection: string;
  since?: Date | null;
  limit: number;
  offset: number;
}) {
  const limit = Math.min(Math.max(1, params.limit), 500);
  const offset = Math.max(0, params.offset);
  const { collection } = params;

  const filters = [eq(datawarehouse.collection, collection)];
  if (params.since) {
    filters.push(gte(datawarehouse.updatedAt, params.since));
  }

  const whereClause = and(...filters);

  const itemsQuery = db
    .select()
    .from(datawarehouse)
    .where(whereClause)
    .orderBy(datawarehouse.updatedAt, datawarehouse.key)
    .limit(limit)
    .offset(offset);

  const countQuery = db
    .select({ total: sql<number>`count(*)` })
    .from(datawarehouse)
    .where(whereClause);

  const [items, countResult] = await Promise.all([itemsQuery, countQuery]);

  return {
    items,
    meta: {
      offset,
      limit,
      total: Number(countResult[0]?.total ?? 0),
    },
  };
}

export async function deleteDatawarehouseRecordById(params: { id: string }) {
  const [rec] = await db
    .select()
    .from(datawarehouse)
    .where(eq(datawarehouse.id, params.id))
    .limit(1);
  if (!rec) return;
  await upsertDatawarehouseTombstones([
    { collection: rec.collection, key: rec.key },
  ]);
  await syncFileLinks({
    kind: "datawarehouse",
    recordId: rec.id,
    previousData: rec.data,
    nextData: {},
  });
  await db.delete(datawarehouse).where(eq(datawarehouse.id, params.id));
}
