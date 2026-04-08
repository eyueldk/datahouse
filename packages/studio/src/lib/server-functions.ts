import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@datahouse/client";
import type { AnyDatahouse } from "@datahouse/core";

const DATAHOUSE_URL = process.env.DATAHOUSE_URL ?? "http://localhost:2510";

const client = createClient<AnyDatahouse>({ domain: DATAHOUSE_URL });

export const listSources = createServerFn().handler(async () => {
  return client.sources.list({});
});

export const createSource = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      extractorId: z.string().min(1),
      config: z.unknown().optional(),
    }),
  )
  .handler(async ({ data }) => {
    return client.sources.create({
      extractorId: data.extractorId,
      config: data.config,
    });
  });

export const deleteSource = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    return client.sources.remove({ id: data.id });
  });

export const extractSource = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    return client.sources.extract({ id: data.id });
  });

export const listExtractors = createServerFn().handler(async () => {
  return client.extractors.list({});
});

export const listRuns = createServerFn()
  .inputValidator(
    z.object({
      type: z.enum(["extract", "transform"]).optional(),
      limit: z.number().int().positive().optional(),
      offset: z.number().int().nonnegative().optional(),
    }).optional(),
  )
  .handler(async ({ data }) => {
    return client.runs.list({
      type: data?.type,
      limit: data?.limit,
      offset: data?.offset,
    });
  });

export const getRun = createServerFn()
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    return client.runs.get({ id: data.id });
  });

export const listDatalake = createServerFn()
  .inputValidator(
    z.object({
      extractorId: z.string().optional(),
    }).optional(),
  )
  .handler(async ({ data }) => {
    const items = [];
    for await (const page of client.datalake.pages({
      extractorId: data?.extractorId,
      limit: 200,
    })) {
      items.push(...page.items);
    }
    return { items };
  });

export const transformDatalake = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string().min(1),
      transformerIds: z.array(z.string()).optional(),
    }),
  )
  .handler(async ({ data }) => {
    return client.datalake.transform({
      id: data.id,
      transformerIds: data.transformerIds,
    });
  });

export const listTransformers = createServerFn()
  .inputValidator(
    z.object({
      extractorId: z.string().optional(),
    }).optional(),
  )
  .handler(async ({ data }) => {
    return client.transformers.list({ extractorId: data?.extractorId });
  });

export const listDatawarehouseCollections = createServerFn().handler(
  async () => {
    return client.datawarehouse.collections();
  },
);

export const listDatawarehouseRecords = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      collection: z.string().min(1),
      limit: z.number().int().positive().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const items = [];
    for await (const page of client.datawarehouse.records({
      collection: data.collection,
      limit: data.limit ?? 200,
    })) {
      items.push(...page.items);
    }
    return { items };
  });
