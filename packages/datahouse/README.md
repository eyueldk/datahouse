# datahouse

CLI and framework for **extract → transform** pipelines, a local **runtime** API, and **Studio**.

This is the **only published package** from the Datahouse monorepo: there are no separate npm packages for `@datahouse/core`, `@datahouse/runtime`, etc. — those workspaces exist for development only and are consumed through **`datahouse`** / **`datahouse/core`**.

## Install

```bash
bun add datahouse
```

Use `z` and helpers from **`datahouse/core`** (Zod 4.3.5 ships with the package).

## Config

Default-export a `createDatahouse` config (e.g. `src/index.ts`):

```ts
import { createDatahouse, createPipeline } from "datahouse/core";
import { myExtractor } from "./extractors/my";
import { myTransformer } from "./transformers/my";

export default createDatahouse({
  pipelines: [createPipeline(myExtractor, myTransformer)],
});
```

## Commands

```bash
datahouse serve              # API, default :2510
datahouse serve ./src/index.ts --port 3000
datahouse studio             # Studio UI, default :2511
```

## Env (common)

| Variable | Role |
|----------|------|
| `DATABASE_URL` | Postgres; omit → embedded PGlite (`.datahouse/pglite`) |
| `DATABASE_URL` | Postgres; omit → embedded PGlite (`.datahouse/pglite`) |
| `BUNQUEUE_HOST` / `BUNQUEUE_PORT` | Queues (defaults to embedded mode if host is missing) |
| `S3_*` | Object storage (defaults MinIO-style local) |
