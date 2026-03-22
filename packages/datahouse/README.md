# datahouse

`datahouse` is the main framework package and CLI for building extraction + transformation pipelines and running them with a local server and Studio UI.

## Install

```bash
bun add datahouse zod
# or
npm install datahouse zod
```

`zod` is used to define extractor config and collection schemas.

## What you need to implement

At minimum, implement these 4 parts:

1. **Extractor**: fetches raw data and emits records.
2. **Transformer**: converts raw extractor data into one or more collections.
3. **Collection(s)**: typed output schemas for transformed data.
4. **DataHouse config**: wires everything together using `createPipeline` and `createDataHouse`.

Recommended project structure:

```txt
src/
  extractors/
    books.ts
  transformers/
    books.ts
  collections/
    books.ts
  index.ts
```

## Complete implementation example

### `src/collections/books.ts`

```ts
import { z } from "zod";
import { createCollection } from "datahouse";

export const booksCollection = createCollection({
  id: "books",
  schema: z.object({
    title: z.string(),
    author: z.string(),
  }),
});
```

### `src/extractors/books.ts`

```ts
import { z } from "zod";
import { createExtractor } from "datahouse";

type BookInput = {
  id: string;
  title: string;
  author: string;
};

export const booksExtractor = createExtractor<BookInput, { query: string }>({
  id: "books-extractor",
  cron: "*/5 * * * *",
  config: {
    schema: z.object({
      query: z.string().min(1),
    }),
    create: async (input) => ({
      key: input.query,
      config: { query: input.query },
    }),
  },
  extract: async ({ config, emit }) => {
    // Replace this with your real source call
    const rows: BookInput[] = [
      { id: "1", title: `Example for ${config.query}`, author: "DataHouse" },
    ];

    await emit(
      rows.map((row) => ({
        key: row.id,
        data: row,
      })),
    );
  },
});
```

### `src/transformers/books.ts`

```ts
import { createTransformer } from "datahouse";
import { booksCollection } from "../collections/books";
import { booksExtractor } from "../extractors/books";

export const booksTransformer = createTransformer({
  id: "books-transformer",
  extractor: booksExtractor,
  collections: [booksCollection],
  transform: async ({ data, emit }) => {
    await emit("books", [
      {
        key: data.id,
        data: {
          title: data.title,
          author: data.author,
        },
      },
    ]);
  },
});
```

### `src/index.ts`

```ts
import { createDataHouse, createPipeline } from "datahouse";
import { booksExtractor } from "./extractors/books";
import { booksTransformer } from "./transformers/books";

export default createDataHouse({
  pipelines: [createPipeline(booksExtractor, booksTransformer)],
});
```

## Run the framework

### Start the server

```bash
# Uses first existing config file in this order:
# index.js, index.ts, src/index.js, src/index.ts
datahouse serve

# Or provide an explicit file path
datahouse serve ./src/index.ts

# custom port (default 2510)
datahouse serve --port 3000
```

### Start Studio UI

```bash
datahouse studio

# custom port (default 2511)
datahouse studio --port 5000
```

## CLI overview

- **`datahouse serve [file] [--port]`**: loads your config, runs migrations, starts workers, and serves API endpoints (default port **`2510`**).
- **`datahouse studio [--port]`**: starts the Studio UI server (default **`2511`**).

## Environment variables

- **`DATABASE_URL`** (optional): Postgres connection string. If unset, DataHouse uses embedded PGlite data at `.datahouse/pglite`.
- **`REDIS_HOST`** (optional): Redis host for queues. Default `localhost`.
- **`REDIS_PORT`** (optional): Redis port. Default `6379`.
- **`S3_ENDPOINT`** (optional): S3-compatible endpoint (for example MinIO). Default `http://localhost:9000`.
- **`S3_ACCESS_KEY_ID`** (optional): Default `minioadmin`.
- **`S3_SECRET_ACCESS_KEY`** (optional): Default `minioadmin`.
- **`S3_BUCKET`** (optional): Default `datahouse`.

## Troubleshooting

- **PGlite / `RuntimeError: Aborted` on migrate (embedded DB):** The on-disk folder `.datahouse/pglite` can end up inconsistent after a crash, kill, or tooling upgrade. Delete that folder and run `datahouse serve` again from your app directory, or set **`DATABASE_URL`** to a normal Postgres URL to skip PGlite.

## Notes

- Your config module should default-export the result of `createDataHouse(...)`.
- You can define multiple pipelines in one config.
- Keep extractor output and collection schemas stable to preserve type safety across your app.
