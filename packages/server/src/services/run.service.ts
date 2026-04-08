import { desc, eq, sql } from "drizzle-orm";
import { dbBackend } from "../configs/database.config";
import { runs, type RunType } from "../schemas/runs";

const { db } = dbBackend;

export async function createRun(params: { type: RunType }) {
  const [row] = await db
    .insert(runs)
    .values({ type: params.type, status: "running" })
    .returning();
  if (!row) {
    throw new Error("Failed to create run");
  }
  return row;
}

export async function completeRun(params: { runId: string }) {
  await db
    .update(runs)
    .set({ status: "completed", completedAt: new Date() })
    .where(eq(runs.id, params.runId));
}

export async function failRun(params: { runId: string; error: string }) {
  await db
    .update(runs)
    .set({
      status: "failed",
      error: params.error,
      completedAt: new Date(),
    })
    .where(eq(runs.id, params.runId));
}

export async function paginateRuns(params: {
  type?: RunType;
  limit: number;
  offset: number;
}) {
  const limit = Math.max(1, params.limit);
  const offset = Math.max(0, params.offset);

  const whereClause =
    params.type !== undefined ? eq(runs.type, params.type) : undefined;

  const itemsBase = db.select().from(runs);
  const countBase = db.select({ total: sql<number>`count(*)` }).from(runs);

  const [items, totalRows] = await Promise.all([
    (whereClause ? itemsBase.where(whereClause) : itemsBase)
      .orderBy(desc(runs.startedAt), desc(runs.id))
      .limit(limit)
      .offset(offset),
    whereClause ? countBase.where(whereClause) : countBase,
  ]);
  return {
    items,
    total: Number(totalRows[0]?.total ?? 0),
  };
}

export async function findRun(params: { id: string }) {
  const [row] = await db
    .select()
    .from(runs)
    .where(eq(runs.id, params.id))
    .limit(1);
  return row;
}
