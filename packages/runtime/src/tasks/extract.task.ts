import { UploadedFile } from "@datahouse/core";
import { config } from "../configs/core.config";
import { taskBackend } from "../configs/task.config";
import { findSource, updateSource } from "../services/source.service";
import { createRun, completeRun, failRun } from "../services/run.service";
import { saveBronzeRecords } from "../services/bronze-records.service";
import { uploadFile, downloadFile } from "../services/files.service";
import { transformTask } from "./transform.task";

export interface ExtractTaskData {
  sourceId: string;
}

export interface ExtractTaskResult {
  extracted: number;
}

export const extractTask = taskBackend.register<
  ExtractTaskData,
  ExtractTaskResult
>({
  name: "extract",
  execute: async ({ data }) => {
    let extracted = 0;
    const { sourceId } = data;
    const source = await findSource({ id: sourceId });

    const pipelines = config.pipelines.filter(
      (p) => p.extractor.id === source.extractorId,
    );
    if (pipelines.length === 0) {
      console.error(
        `[extract] No pipeline found for sourceId=${sourceId} (extractorId=${source.extractorId})`,
      );
      return { extracted };
    }

    const firstPipeline = pipelines[0];
    if (!firstPipeline) {
      return { extracted };
    }
    const { extractor } = firstPipeline;

    const run = await createRun({ type: "extract" });
    try {
      await extractor.extract({
        config: source.config,
        cursor: source.cursor,
        upload: async (params: {
          content: File | Blob | ArrayBuffer;
          name?: string;
          mimeType?: string;
        }) => {
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
        download: async (params: { id: string }) => {
          const { content } = await downloadFile({ id: params.id });
          return content;
        },
        emit: async (
          items: Array<{ key: string; data: unknown }>,
          cursor?: unknown,
        ) => {
          if (items.length > 0) {
            const insertedRows = await saveBronzeRecords({
              runId: run.id,
              sourceId: source.id,
              items,
            });
            extracted += insertedRows.length;
            for (const pipeline of pipelines) {
              for (const row of insertedRows) {
                await transformTask.enqueue({
                  data: {
                    transformerId: pipeline.transformer.id,
                    bronzeRecordId: row.id,
                  },
                });
              }
            }
          }
          if (cursor !== undefined) {
            await updateSource({ sourceId: source.id, cursor });
          }
        },
      });
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
