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

`config` is optional on the extractor. When omitted, `extract` is called **without** `config` on the context (unless the host attaches optional source JSON). When a `config` block exists, the host passes `config` from the source row; it may be `undefined` if unset—narrow before use.

```ts
const fetcher = createExtractor({
  id: "fetcher",
  cron: "0 * * * *",
  config: {
    schema: z.object({ url: z.string().url() }),
    create: (input) => ({ key: `fetcher:${input.url}`, config: input }),
  },
  extract: async function* ({ config }) {
    if (!config) return;
    const res = await fetch(config.url);
    const data = await res.json();
    yield { items: [{ key: "item-1", data }] };
  },
});
```

```ts
const stateless = createExtractor({
  id: "stateless",
  cron: "0 * * * *",
  extract: async function* () {
    yield { items: [{ key: "row-1", data: { ok: true } }] };
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
