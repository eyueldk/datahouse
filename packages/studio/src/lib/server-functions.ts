import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@datahousejs/client";
import type { AnyDatahouse } from "@datahousejs/core";

const DATAHOUSE_URL = process.env.DATAHOUSE_URL ?? "http://localhost:2510";

const client = createClient<AnyDatahouse>({ baseUrl: DATAHOUSE_URL });

export const getApiVersion = createServerFn().handler(async () => {
  return await client.version.get();
});

export const listSources = createServerFn({ method: "POST" })
  .inputValidator((data: Parameters<typeof client.sources.list>[0]) => data)
  .handler(async ({ data }) => {
    return await client.sources.list(data);
  });

export const createSource = createServerFn({ method: "POST" })
  .inputValidator((data: Parameters<typeof client.sources.create>[0]) => data)
  .handler(async ({ data }) => {
    return await client.sources.create(data);
  });

export const deleteSource = createServerFn({ method: "POST" })
  .inputValidator((data: Parameters<typeof client.sources.delete>[0]) => data)
  .handler(async ({ data }) => {
    return await client.sources.delete(data);
  });

export const extractSource = createServerFn({ method: "POST" })
  .inputValidator((data: Parameters<typeof client.sources.extract>[0]) => data)
  .handler(async ({ data }) => {
    return await client.sources.extract(data);
  });

export const listExtractors = createServerFn({ method: "POST" })
  .inputValidator((data: Parameters<typeof client.extractors.list>[0]) => data)
  .handler(async ({ data }) => {
    return await client.extractors.list(data);
  });

export const listRuns = createServerFn({ method: "POST" })
  .inputValidator((data: Parameters<typeof client.runs.list>[0]) => data)
  .handler(async ({ data }) => {
    return await client.runs.list(data);
  });

export const getRun = createServerFn({ method: "POST" })
  .inputValidator((data: Parameters<typeof client.runs.get>[0]) => data)
  .handler(async ({ data }) => {
    return await client.runs.get(data);
  });

export const listDatalake = createServerFn({ method: "POST" })
  .inputValidator((data: Parameters<typeof client.datalakeRecords.list>[0]) => data)
  .handler(async ({ data }) => {
    return await client.datalakeRecords.list(data);
  });

export const transformDatalake = createServerFn({ method: "POST" })
  .inputValidator((data: Parameters<typeof client.datalakeRecords.transform>[0]) => data)
  .handler(async ({ data }) => {
    return await client.datalakeRecords.transform(data);
  });

export const deleteDatalakeRecord = createServerFn({ method: "POST" })
  .inputValidator((data: Parameters<typeof client.datalakeRecords.delete>[0]) => data)
  .handler(async ({ data }) => {
    return await client.datalakeRecords.delete(data);
  });

export const listTransformers = createServerFn({ method: "POST" })
  .inputValidator((data: Parameters<typeof client.transformers.list>[0]) => data)
  .handler(async ({ data }) => {
    return await client.transformers.list(data);
  });

export const listDatawarehouseCollections = createServerFn().handler(
  async () => {
    return await client.datawarehouseCollections.list();
  },
);

export const listDatawarehouseRecords = createServerFn({ method: "POST" })
  .inputValidator(
    (data: Parameters<typeof client.datawarehouseRecords.pages>[0]) => data,
  )
  .handler(async ({ data }) => {
    const items = [];
    for await (const page of client.datawarehouseRecords.pages(data)) {
      items.push(...page.items);
    }
    return { items };
  });

export const deleteDatawarehouseRecord = createServerFn({ method: "POST" })
  .inputValidator(
    (data: Parameters<typeof client.datawarehouseRecords.delete>[0]) => data,
  )
  .handler(async ({ data }) => {
    return await client.datawarehouseRecords.delete(data);
  });