# datahouse

ETL framework for building data pipelines: extract → transform → load, with a server API and Studio UI for orchestration and inspection.

## Use Case

Define extractors (scheduled fetchers) and transformers (mapping functions), wire them into pipelines, then query the results via HTTP or browse in Studio.

```bash
bun add datahouse
```

Create a pipeline in `datahouse.config.ts`:

```ts
import {
  createDatahouse,
  createPipeline,
  createCollection,
} from "datahouse/core";
import { createExtractor, createTransformer } from "datahouse/core";
import { z } from "zod";

const books = createCollection({
  id: "books",
  schema: z.object({ title: z.string(), author: z.string() }),
});

const fetcher = createExtractor({
  id: "fetcher",
  cron: "0 * * * *",
  extract: async function* ({ config }) {
    const res = await fetch("https://openlibrary.org/works/OL12345.json");
    yield { items: [{ key: "book1", data: await res.json() }] };
  },
});

const processor = createTransformer({
  id: "processor",
  extractor: fetcher,
  collections: [books],
  transform: async function* ({ data }) {
    yield { collection: "books", items: [{ key: data.title, data }] };
  },
});

export default createDatahouse({
  pipelines: [createPipeline(fetcher, processor)],
});
```

Run the server and Studio:

```bash
datahouse serve   # API at http://localhost:2510
datahouse studio # UI at http://localhost:2511
```

## Packages

| Package            | Description                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| `datahouse`        | Published CLI (`serve`, `studio`)                                                                      |
| `datahouse/core`   | Types: `createDatahouse`, `createPipeline`, `createExtractor`, `createTransformer`, `createCollection` |
| `datahouse/client` | Typed API client (Elysia Treaty)                                                                       |

See `packages/*/README.md` for package-specific docs.

## Dev

```bash
bun install && bun run build
```
