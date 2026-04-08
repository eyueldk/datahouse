import { datahouse } from "../configs/core.config";
import { extractQueue } from "../queues/extract.queue";
import { datawarehouseTombstonesCleanupQueue } from "../queues/datawarehouse-tombstones-cleanup.queue";
import { orphanFilesCleanupQueue } from "../queues/orphan-files-cleanup.queue";
import { listSources } from "./source.service";

export async function setupExtractCronJob(params: {
  source: Awaited<ReturnType<typeof listSources>>[number];
}): Promise<void> {
  const { source } = params;
  const pipeline = datahouse.pipelines.find(
    (p) => p.extractor.id === source.extractorId,
  );
  if (!pipeline) {
    await extractQueue.unschedule({ key: `extract:${source.id}` });
  } else {
    await extractQueue.schedule({
      key: `extract:${source.id}`,
      cron: pipeline.extractor.cron,
      data: { sourceId: source.id },
    });
  }
}

export async function setupCronJobs(): Promise<void> {
  const allSources = await listSources();
  for (const source of allSources) {
    await setupExtractCronJob({ source });
  }

  await datawarehouseTombstonesCleanupQueue.schedule({
    key: "datawarehouse-tombstones-cleanup",
    cron: "15 3 * * *", // daily at 3:15
    data: {},
  });

  await orphanFilesCleanupQueue.schedule({
    key: "orphan-files-cleanup",
    cron: "0 3 * * *", // daily at 3:00
    data: {},
  });
}
