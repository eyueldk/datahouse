# @datahousejs/core

Core types and pipeline primitives: collections, extractors, transformers, and the root `Datahouse` object.

## API

```ts
import {
  createDatahouse,
  createPipeline,
  createExtractor,
  createTransformer,
  createCollection,
} from "datahouse/core";
```

### Collection

```ts
const books = createCollection({
  id: "books",
  schema: z.object({
    title: z.string(),
    author: z.string(),
  }),
});
```

### Extractor

```ts
const fetcher = createExtractor({
  id: "fetcher",
  cron: "0 * * * *", // cron expression (optional)
  extract: async function* ({ config }) {
    // fetch and yield items: { key, data }
    const res = await fetch(config.url);
    const data = await res.json();
    yield { items: [{ key: "item-1", data }] };
  },
});
```

### Transformer

```ts
const processor = createTransformer({
  id: "processor",
  extractor: fetcher,
  collections: [books],
  transform: async function* ({ data }) {
    // map data to collection items
    yield {
      collection: "books",
      items: [
        { key: data.title, data: { title: data.title, author: data.author } },
      ],
    };
  },
});
```

### Pipeline

```ts
export default createDatahouse({
  pipelines: [createPipeline(fetcher, processor)],
});
```

Pass the `Datahouse` config to `datahouse serve` or `@datahousejs/server`.
