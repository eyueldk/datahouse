/**
 * Minimal standalone example: one extractor → one transformer → one collection.
 * Not wired to the runtime; useful as API documentation and for local typechecking.
 */
import { z } from "zod";
import {
  createCollection,
  createDatahouse,
  createExtractor,
  createPipeline,
  createTransformer,
} from "../src/index.ts";

/** Raw row emitted by {@link dummyExtractor} (stored in datalake). */
export type DummyDatalakeRecord = { raw: string };

const configSchema = z.object({
  seed: z.string().default("demo"),
});

export const dummyExtractor = createExtractor({
  id: "dummy-extractor",
  cron: "0 0 * * *",
  config: {
    schema: configSchema,
    create: (input) => ({
      key: `dummy:${input.seed}`,
      config: input,
    }),
  },
  async *extract({ config }) {
    yield {
      items: [
        {
          key: "datalake-1",
          data: { raw: `hello from ${config.seed}` },
        },
      ],
    };
  },
});

export const dummyItemsCollection = createCollection({
  id: "items",
  schema: z.object({
    id: z.string(),
    text: z.string(),
  }),
});

export const dummyTransformer = createTransformer({
  id: "dummy-transformer",
  extractor: dummyExtractor,
  collections: [dummyItemsCollection],
  async *transform({ data }) {
    yield {
      collection: "items",
      items: [
        {
          key: data.raw,
          data: { id: "1", text: data.raw },
        },
      ],
    };
  },
});

export const dummyDatahouse = createDatahouse({
  pipelines: [createPipeline(dummyExtractor, dummyTransformer)],
});
