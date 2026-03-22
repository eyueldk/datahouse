import { config } from "../configs/core.config";
import { extractTask } from "../tasks/extract.task";
import { listSources } from "./source.service";

export async function setupExtractCronJob(params: {
  source: Awaited<ReturnType<typeof listSources>>[number];
}): Promise<void> {
  const { source } = params;
  const pipeline = config.pipelines.find(
    (p) => p.extractor.id === source.extractorId,
  );
  if (!pipeline) {
    await extractTask.unschedule({ key: `extract:${source.id}` });
    return;
  }

  await extractTask.schedule({
    key: `extract:${source.id}`,
    cron: pipeline.extractor.cron,
    data: { sourceId: source.id },
  });
}

export async function setupExtractCronJobs(): Promise<void> {
  const allSources = await listSources();
  for (const source of allSources) {
    await setupExtractCronJob({ source });
  }
}
