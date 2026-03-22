# @datahouse/core

Framework-agnostic ETL primitives: extractors (batch streaming), transformers, loaders, and pipeline config.

## defineConfig

The core entry point is **`defineConfig`**. It builds a typed DataHouse config from an array of pipelines. Pass that config to adapters (e.g. runners, job queues) to execute your ETL.

```ts
import {
  defineConfig,
  createPipeline,
  createExtractor,
  createTransformer,
  createLoader,
} from "@datahouse/core";

const config = defineConfig({
  pipelines: [
    createPipeline(myExtractor, myTransformer, myLoader),
    // more pipelines...
  ],
});

// config.pipelines is a typed tuple of your pipelines
```

## Building a pipeline

Each pipeline is **extract → transform → load**. Use `createPipeline(extractor, transformer, loader)` to wire the three together.

### Extractor

An extractor pulls data in batches and defines a **cron** schedule for when to run. It receives `{ config, cursor? }` and **yields** `{ cursor?, items: { key, data }[] }`.

Extractor **config** (for source creation / validation) is always:

- `{ schema: z.ZodType<TInput>, create: (input: TInput) => { key: string, config: TConfig } | Promise<{ key: string, config: TConfig }> }`
- `schema` validates source input
- `create` must return a deterministic source identity (`key`) and normalized runtime config (`config`)

```ts
const myExtractor = createExtractor<MyData, MyConfig, MyCursor>({
  id: "my-extractor",
  cron: "0 * * * *", // hourly (adapter-specific)
  config: {
    schema: myConfigSchema,
    create: async (input) => ({
      key: `my-extractor:${input.accountId}`,
      config: input,
    }),
  },
  extract: async function* ({ config, cursor }) {
    let next = cursor;
    do {
      const result = await fetchPage(config, next);
      yield { cursor: result.nextCursor, items: result.items };
      next = result.nextCursor;
    } while (next);
  },
});
```

### Transformer

A transformer takes a single item and yields transformed batches. It receives `{ data: TInput }` and **yields** `{ items: { key, data }[] }` (one transformation can return many results).

```ts
const myTransformer = createTransformer<RawItem, NormalizedItem>({
  id: "my-transformer",
  transform: async function* ({ data }) {
    const items = [
      {
        key: data.id,
        data: normalize(data),
      },
    ];
    yield { items };
  },
});
```

### Loader

A loader describes **where** the pipeline writes (e.g. a table or topic). It has an `id` and a `target` string; the actual write is done by adapters.

```ts
const myLoader = createLoader({
  id: "auctions-loader",
  target: "auctions",
});
```

### Wiring with createPipeline

`createPipeline` takes (extractor, transformer, loader). The extractor’s output type must match the transformer’s input type.

```ts
createPipeline(myExtractor, myTransformer, myLoader);
```

Put one or more of these in `defineConfig({ pipelines: [...] })` to get your typed config.

## Install

```bash
bun install
```
