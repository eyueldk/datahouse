# datahouse

Published CLI and framework exports.

```bash
bun add datahouse
```

## Config

Default-export a `createDatahouse` config:

```ts
import { createDatahouse, createPipeline } from "datahouse/core";

export default createDatahouse({
  pipelines: [createPipeline(myExtractor, myTransformer)],
});
```

## Commands

```bash
datahouse serve              # API server, default :2510
datahouse serve ./src/index.ts --port 3000
datahouse studio             # Studio UI, default :2511
```

## Exports

- `datahouse` — CLI entry
- `datahouse/core` — Core types and primitives
- `datahouse/client` — Typed API client
