# @datahousejs/core

Core types and pipeline primitives: extractors, transformers, collections, and the root `Datahouse` object.

## Usage

```ts
import {
  createDatahouse,
  createPipeline,
  createExtractor,
  createTransformer,
  createCollection,
} from "@datahousejs/core";
```

## Create a Collection

```ts
const books = createCollection({
  id: "books",
  schema: z.object({
    title: z.string(),
    author: z.string(),
  }),
});
```

## Create an Extractor

```ts
const fetcher = createExtractor({
  id: "fetcher",
  cron: "0 * * * *",
  config: {
    schema: z.object({ url: z.string() }),
    create: (input) => ({ key: input.url, config: input }),
  },
  extract: async function* ({ config }) {
    const res = await fetch(config.url);
    const data = await res.json();
    yield { items: [{ key: config.url, data }] };
  },
});
```

## Create a Transformer

```ts
const processor = createTransformer({
  id: "processor",
  extractor: fetcher,
  collections: [books],
  transform: async function* ({ data }) {
    yield {
      collection: "books",
      items: [
        { key: data.title, data: { title: data.title, author: data.author } },
      ],
    };
  },
});
```

## Wire into Datahouse

```ts
export default createDatahouse({
  pipelines: [createPipeline(fetcher, processor)],
});
```

Pass to `@datahousejs/server` or another adapter.
