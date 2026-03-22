import { eq, sql } from "drizzle-orm";
import { dbBackend } from "../configs/database.config";
import { goldRecords } from "../schemas/gold-records";

const { db } = dbBackend;

export async function saveGoldRecords({
  runId,
  bronzeRecordId,
  transformerId,
  items,
}: {
  runId: string;
  bronzeRecordId: string;
  transformerId: string;
  items: { collection: string; key: string; data: unknown }[];
}) {
  if (items.length === 0) return;

  const values = items.map((item) => ({
    runId,
    bronzeRecordId,
    transformerId,
    collection: item.collection,
    key: item.key,
    data: item.data,
  }));

  await db
    .insert(goldRecords)
    .values(values)
    .onConflictDoUpdate({
      target: [goldRecords.collection, goldRecords.key],
      set: {
        runId: sql.raw(`excluded.${goldRecords.runId.name}`),
        bronzeRecordId: sql.raw(
          `excluded.${goldRecords.bronzeRecordId.name}`,
        ),
        transformerId: sql.raw(
          `excluded.${goldRecords.transformerId.name}`,
        ),
        collection: sql.raw(`excluded.${goldRecords.collection.name}`),
        data: sql.raw(`excluded.${goldRecords.data.name}`),
      },
    });
}

export async function listGoldRecords(params: { collection?: string } = {}) {
  let query = db.select().from(goldRecords).$dynamic();
  if (params.collection) {
    query = query.where(eq(goldRecords.collection, params.collection));
  }
  return query.orderBy(goldRecords.createdAt);
}

export async function paginateGoldRecords(params: {
  collection?: string;
  limit: number;
  offset: number;
}) {
  const limit = Math.max(1, params.limit);
  const offset = Math.max(0, params.offset);

  let itemsQuery = db
    .select()
    .from(goldRecords)
    .orderBy(goldRecords.createdAt)
    .$dynamic();
  let countQuery = db
    .select({ total: sql<number>`count(*)` })
    .from(goldRecords)
    .$dynamic();
  if (params.collection) {
    const filter = eq(goldRecords.collection, params.collection);
    itemsQuery = itemsQuery.where(filter);
    countQuery = countQuery.where(filter);
  }
  const [items, totalRows] = await Promise.all([
    itemsQuery.limit(limit).offset(offset),
    countQuery,
  ]);
  return {
    items,
    total: Number(totalRows[0]?.total ?? 0),
  };
}
