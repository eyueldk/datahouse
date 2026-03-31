# @datahouse/core

**Not published.** This workspace exists for monorepo organization only. Apps install **`datahouse`** and import from **`datahouse/core`**.

Framework-agnostic ETL primitives: extractors (async generators), transformers, collections, and the root **Datahouse** object (`datahouse.ts`).

## Root config: `createDatahouse`

The core entry point is **`createDatahouse`** (see `src/datahouse.ts`). It wraps your pipelines in a typed **`Datahouse`** value. Pass that to the runtime or other adapters.

```ts
import {
  createDatahouse,
  createPipeline,
  createExtractor,
  createTransformer,
} from "@datahouse/core";

export default createDatahouse({
  pipelines: [createPipeline(myExtractor, myTransformer)],
});
```

## Building a pipeline

Each pipeline is **extract → transform**. Use `createPipeline(extractor, transformer)`.

### Extractor

An extractor pulls data in batches. It receives `{ config, cursor?, upload, download }` and **yields** `{ items: { key, data }[]; cursor? }`.

Extractor **config** (for source creation / validation) is:

- `{ schema: z.ZodType<TInput>, create: (input: TInput) => { key: string, config: TConfig } | Promise<...> }`
- `schema` validates source input
- `create` returns a deterministic source identity (`key`) and normalized runtime config (`config`)

### Transformer

A transformer receives bronze **`data`** (plus `upload` / `download`) and **yields** **`TransformBatch`** chunks: `{ collection, items }` per collection—same async-generator pattern as **`ExtractBatch`** on the extractor side. The function type is **`TransformGeneratorFunction`** (mirrors **`ExtractGeneratorFunction`**).

### Wiring with `createPipeline`

`createPipeline(extractor, transformer)`. The extractor’s emitted item type must match the transformer’s input type.
