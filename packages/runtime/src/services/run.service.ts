import { desc, eq, sql } from "drizzle-orm";
import { dbBackend } from "../configs/database.config";
import { runs, type RunType } from "../schemas/runs";

const { db } = dbBackend;

export async function createRun({ type }: { type: RunType }) {
  const [run] = await db
    .insert(runs)
    .values({ type, status: "running" })
    .returning();
  if (!run) {
    throw new Error("Failed to create run");
  }
  return run;
}

export async function completeRun({ runId }: { runId: string }) {
  await db
    .update(runs)
    .set({ status: "completed", completedAt: new Date() })
    .where(eq(runs.id, runId));
}

export async function failRun({
  runId,
  error,
}: {
  runId: string;
  error: string;
}) {
  await db
    .update(runs)
    .set({ status: "failed", error, completedAt: new Date() })
    .where(eq(runs.id, runId));
}

export async function listRuns(params: { type?: RunType } = {}) {
  let query = db
    .select()
    .from(runs)
    .orderBy(desc(runs.startedAt), desc(runs.id))
    .$dynamic();
  if (params.type) {
    query = query.where(eq(runs.type, params.type));
  }
  return await query;
}

export async function paginateRuns(params: {
  type?: RunType;
  limit: number;
  offset: number;
}) {
  const limit = Math.max(1, params.limit);
  const offset = Math.max(0, params.offset);

  let itemsQuery = db
    .select()
    .from(runs)
    .orderBy(desc(runs.startedAt), desc(runs.id))
    .$dynamic();
  let countQuery = db
    .select({ total: sql<number>`count(*)` })
    .from(runs)
    .$dynamic();
  if (params.type) {
    const filter = eq(runs.type, params.type);
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

export async function findRun(params: { id: string }) {
  const [run] = await db
    .select()
    .from(runs)
    .where(eq(runs.id, params.id))
    .limit(1);
  return run;
}
