import { config } from "../configs/core.config";
import { transformQueue } from "../queues/transform.queue";
import { findDatalakeRecord } from "./datalake.service";
import { createRun } from "./run.service";

export interface EnqueueTransformationsParams {
  datalakeRecordId: string;
  /**
   * When omitted, enqueues every transformer pipeline for this datalake row's extractor.
   * When `[]`, enqueues nothing.
   * When non-empty, only those transformer ids (must match a pipeline for the extractor).
   */
  transformerIds?: string[];
}

export interface EnqueueTransformationsResult {
  runIds: string[];
  enqueued: number;
}

/**
 * Enqueues transformation jobs for a datalake record. Each job clears existing datawarehouse
 * rows for that (datalake, transformer) pair before writing new output (see transform queue).
 */
export async function enqueueTransformations(
  params: EnqueueTransformationsParams,
): Promise<EnqueueTransformationsResult> {
  const record = await findDatalakeRecord({ id: params.datalakeRecordId });
  const pipelines = config.pipelines.filter(
    (p) => p.extractor.id === record.extractorId,
  );

  let selected = pipelines;
  if (params.transformerIds !== undefined) {
    if (params.transformerIds.length === 0) {
      return { runIds: [], enqueued: 0 };
    }
    const allow = new Set(params.transformerIds);
    selected = pipelines.filter((p) => allow.has(p.transformer.id));
  }

  const runIds: string[] = [];
  for (const pipeline of selected) {
    const transformRun = await createRun({ type: "transform" });
    runIds.push(transformRun.id);
    await transformQueue.enqueue({
      data: {
        transformerId: pipeline.transformer.id,
        datalakeRecordId: params.datalakeRecordId,
        runId: transformRun.id,
      },
    });
  }

  return { runIds, enqueued: runIds.length };
}
