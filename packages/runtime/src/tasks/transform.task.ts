import { UploadedFile } from "@datahouse/core";
import { config } from "../configs/core.config";
import { taskBackend } from "../configs/task.config";
import { findBronzeRecord } from "../services/bronze-records.service";
import { saveGoldRecords } from "../services/gold-records.service";
import { createRun, completeRun, failRun } from "../services/run.service";
import { uploadFile, downloadFile } from "../services/files.service";

export interface TransformTaskData {
  transformerId: string;
  bronzeRecordId: string;
}

export interface TransformTaskResult {
  transformed: number;
}

export const transformTask = taskBackend.register<
  TransformTaskData,
  TransformTaskResult
>({
  name: "transform",
  execute: async ({ data }) => {
    let transformed = 0;
    const { transformerId, bronzeRecordId } = data;

    const pipeline = config.pipelines.find(
      (p) => p.transformer.id === transformerId,
    );
    if (!pipeline) {
      console.error(
        `[transform] No pipeline found for transformerId=${transformerId}`,
      );
      return { transformed };
    }

    const bronzeRecord = await findBronzeRecord({ id: bronzeRecordId });
    const run = await createRun({ type: "transform" });

    try {
      await pipeline.transformer.transform({
        data: bronzeRecord.data,
        upload: async (params) => {
          const record = await uploadFile({
            content: params.content,
            name: params.name,
            mimeType: params.mimeType,
          });
          return new UploadedFile({
            id: record.id,
            name: record.name,
            mimeType: record.mimeType,
            size: record.size,
            createdAt: record.createdAt,
          });
        },
        download: async (params) => {
          const { content } = await downloadFile({ id: params.id });
          return content;
        },
        emit: async ({ collection, items }) => {
          if (items.length === 0) {
            return;
          }
          transformed += items.length;
          await saveGoldRecords({
            runId: run.id,
            bronzeRecordId,
            transformerId,
            items: items.map((item) => ({
              collection,
              key: item.key,
              data: item.data,
            })),
          });
        },
      });
      await completeRun({ runId: run.id });
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
