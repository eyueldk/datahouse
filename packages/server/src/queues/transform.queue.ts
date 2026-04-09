import { UploadedFile } from "@datahousejs/core";
import { datahouse } from "../configs/core.config";
import { queueBackend } from "../configs/queue.config";
import { findDatalakeRecord } from "../services/datalake.service";
import {
  deleteDatawarehouseRecordsForDatalakeTransformer,
  saveDatawarehouseRecords,
} from "../services/datawarehouse.service";
import {
  completeRun,
  createRun,
  failRun,
  findRun,
} from "../services/run.service";
import { uploadFile, downloadFile } from "../services/files.service";

export interface TransformQueueData {
  transformerId: string;
  datalakeRecordId: string;
  /** When set, this transform run row was created at enqueue time and must be used. */
  runId?: string;
}

export interface TransformQueueResult {
  transformed: number;
}

export const transformQueue = queueBackend.register<
  TransformQueueData,
  TransformQueueResult
>({
  name: "transform",
  execute: async ({ data }) => {
    let transformed = 0;
    const { transformerId, datalakeRecordId } = data;

    const pipeline = datahouse.pipelines.find(
      (p) => p.transformer.id === transformerId,
    );
    if (!pipeline) {
      console.error(
        `[transform] No pipeline found for transformerId=${transformerId}`,
      );
      return { transformed };
    }

    const datalakeRecord = await findDatalakeRecord({ id: datalakeRecordId });
    await deleteDatawarehouseRecordsForDatalakeTransformer({
      datalakeId: datalakeRecordId,
      transformerId,
    });
    let run;
    if (data.runId) {
      const existing = await findRun({ id: data.runId });
      if (!existing) {
        throw new Error(`Run ${data.runId} not found`);
      }
      run = existing;
    } else {
      run = await createRun({ type: "transform" });
    }

    try {
      for await (const batch of pipeline.transformer.transform({
        data: datalakeRecord.data,
        upload: async (params) => {
          const uploaded = await uploadFile({
            content: params.content,
            name: params.name,
            mimeType: params.mimeType,
          });
          if (!uploaded) {
            throw new Error("uploadFile returned no record");
          }
          return new UploadedFile({
            id: uploaded.id,
            name: uploaded.name,
            mimeType: uploaded.mimeType,
            size: uploaded.size,
            createdAt: uploaded.createdAt,
          });
        },
        download: async (params) => {
          const { content } = await downloadFile({ id: params.id });
          return content;
        },
      })) {
        const { collection, items } = batch;
        if (items.length === 0) {
          continue;
        }
        transformed += items.length;
        await saveDatawarehouseRecords({
          runId: run.id,
          datalakeId: datalakeRecordId,
          transformerId,
          items: items.map((item) => ({
            collection,
            key: item.key,
            data: item.data,
          })),
        });
      }
      await completeRun({
        runId: run.id,
      });
      return { transformed };
    } catch (error) {
      await failRun({
        runId: run.id,
        error: String(error),
      });
      throw error;
    }
  },
});
