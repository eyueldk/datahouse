import { UploadedFile } from "@datahousejs/core";
import { datahouse } from "../configs/core.config";
import { queueBackend } from "../configs/queue.config";
import { findSource, updateSource } from "../services/source.service";
import {
  completeRun,
  createRun,
  failRun,
  findRun,
} from "../services/run.service";
import { saveDatalakeRecords } from "../services/datalake.service";
import { uploadFile, downloadFile } from "../services/files.service";
import { enqueueTransformations } from "../services/transform-enqueue.service";

export interface ExtractQueueData {
  sourceId: string;
  /** When set, this extract run row was created at enqueue time and must be used. */
  runId?: string;
}

export interface ExtractQueueResult {
  extracted: number;
}

export const extractQueue = queueBackend.register<
  ExtractQueueData,
  ExtractQueueResult
>({
  name: "extract",
  execute: async ({ data }) => {
    let extracted = 0;
    const { sourceId } = data;
    const source = await findSource({ id: sourceId });

    const pipelines = datahouse.pipelines.filter(
      (p) => p.extractor.id === source.extractorId,
    );
    if (pipelines.length === 0) {
      console.error(
        `[extract] No pipeline found for sourceId=${sourceId} (extractorId=${source.extractorId})`,
      );
      if (data.runId) {
        await failRun({
          runId: data.runId,
          error: "No pipeline found for this source extractor.",
        });
      }
      return { extracted };
    }

    const firstPipeline = pipelines[0];
    if (!firstPipeline) {
      if (data.runId) {
        await failRun({
          runId: data.runId,
          error: "No pipeline found for this source extractor.",
        });
      }
      return { extracted };
    }
    const { extractor } = firstPipeline;

    let run;
    if (data.runId) {
      const existing = await findRun({ id: data.runId });
      if (!existing) {
        throw new Error(`Run ${data.runId} not found`);
      }
      run = existing;
    } else {
      run = await createRun({ type: "extract" });
    }
    try {
      for await (const batch of extractor.extract({
        config: source.config,
        cursor: source.cursor,
        upload: async (params: {
          content: Buffer;
          name?: string;
          mimeType?: string;
        }) => {
          const record = await uploadFile({
            content: params.content,
            name: params.name,
            mimeType: params.mimeType,
          });
          if (!record) {
            throw new Error("uploadFile returned no row");
          }
          return new UploadedFile({
            id: record.id,
            name: record.name,
            mimeType: record.mimeType,
            size: record.size,
            createdAt: record.createdAt,
          });
        },
        download: async (params: { id: string }) => {
          const { content } = await downloadFile({ id: params.id });
          return content;
        },
      })) {
        const { items, cursor } = batch;
        if (items.length > 0) {
          const insertedRecords = await saveDatalakeRecords({
            runId: run.id,
            sourceId: source.id,
            extractorId: source.extractorId,
            items,
          });
          extracted += insertedRecords.length;
          for (const record of insertedRecords) {
            await enqueueTransformations({ datalakeRecordId: record.id });
          }
        }
        if (cursor !== undefined) {
          await updateSource({ sourceId: source.id, cursor });
        }
      }
      await completeRun({ runId: run.id });
      return { extracted };
    } catch (error) {
      await failRun({
        runId: run.id,
        error: String(error),
      });
      throw error;
    }
  },
});
