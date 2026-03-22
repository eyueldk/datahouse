import { eq, sql } from "drizzle-orm";
import { dbBackend } from "../configs/database.config";
import { bronzeRecords } from "../schemas/bronze-records";

const { db } = dbBackend;

export async function findBronzeRecord(params: { id: string }) {
  const [row] = await db
    .select()
    .from(bronzeRecords)
    .where(eq(bronzeRecords.id, params.id))
    .limit(1);
  if (!row) {
    throw new Error(`Bronze record not found: ${params.id}`);
  }
  return row;
}

export async function saveBronzeRecords({
  runId,
  sourceId,
  items,
}: {
  runId: string;
  sourceId: string;
  items: { key: string; data: unknown }[];
}): Promise<{ id: string }[]> {
  if (items.length === 0) return [];

  const values = items.map((item) => ({
    runId,
    sourceId,
    key: item.key,
    data: item.data,
  }));

  const rows = await db
    .insert(bronzeRecords)
    .values(values)
    .onConflictDoUpdate({
      target: bronzeRecords.key,
      set: {
        runId: sql.raw(`excluded.${bronzeRecords.runId.name}`),
        sourceId: sql.raw(`excluded.${bronzeRecords.sourceId.name}`),
        data: sql.raw(`excluded.${bronzeRecords.data.name}`),
      },
    })
    .returning();
  return rows.map((row) => ({ id: row.id }));
}
