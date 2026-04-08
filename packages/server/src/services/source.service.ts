import { eq, and, sql } from "drizzle-orm";
import { dbBackend } from "../configs/database.config";
import { sources } from "../schemas/sources";

const { db } = dbBackend;

export async function listSources(params: { extractorId?: string } = {}) {
  let query = db.select().from(sources).$dynamic();
  if (params.extractorId) {
    query = query.where(eq(sources.extractorId, params.extractorId));
  }
  return await query;
}

export async function paginateSources(params: {
  extractorId?: string;
  limit: number;
  offset: number;
}) {
  const limit = Math.max(1, params.limit);
  const offset = Math.max(0, params.offset);

  let itemsQuery = db.select().from(sources).$dynamic();
  let countQuery = db
    .select({ total: sql<number>`count(*)` })
    .from(sources)
    .$dynamic();
  if (params.extractorId) {
    const filter = eq(sources.extractorId, params.extractorId);
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

export async function findSource(
  params: { id: string } | { extractorId: string; key: string },
) {
  const whereClause =
    "id" in params
      ? eq(sources.id, params.id)
      : and(
          eq(sources.extractorId, params.extractorId),
          eq(sources.key, params.key),
        );
  const [source] = await db
    .select()
    .from(sources)
    .where(whereClause)
    .limit(1);
  if (!source) {
    throw new Error(`Source not found for ${JSON.stringify(params)}`);
  }
  return source;
}

export async function updateSource({
  sourceId,
  ...data
}: { sourceId: string } & Partial<typeof sources.$inferInsert>) {
  const [source] = await db
    .update(sources)
    .set(data)
    .where(eq(sources.id, sourceId))
    .returning();
  return source;
}

export async function createSource(data: typeof sources.$inferInsert) {
  const [source] = await db.insert(sources).values(data).returning();
  return source;
}

export async function deleteSource(id: string) {
  await db.delete(sources).where(eq(sources.id, id));
}
