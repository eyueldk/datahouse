# datahouse

Published CLI and framework. Install from npm:

```bash
bun add datahouse
```

## Config

Default-export a `Datahouse` config built with `createDatahouse` from `datahouse/core`:

```ts
import {
  createDatahouse,
  createPipeline,
  createExtractor,
  createTransformer,
} from "datahouse/core";

const extractor = createExtractor({
  id: "my-extractor",
  cron: "0 * * * *",
  extract: async function* () {
    // yield { items: [{ key, data }] }
  },
});

const transformer = createTransformer({
  id: "my-transformer",
  extractor,
  transform: async function* ({ data }) {
    // yield { collection, items: [{ key, data }] }
  },
});

export default createDatahouse({
  pipelines: [createPipeline(extractor, transformer)],
});
```

## Commands

```bash
datahouse serve              # API server, default http://localhost:2510
datahouse serve ./config.ts  # Custom config path and port
datahouse serve --port 3000

datahouse studio             # Studio UI, default http://localhost:2511
```

## Exports

| Path               | Description                                                                                     |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| `datahouse`        | CLI entry (`serve`, `studio`)                                                                   |
| `datahouse/core`   | `createDatahouse`, `createPipeline`, `createExtractor`, `createTransformer`, `createCollection` |
| `datahouse/client` | `createClient` — typed API client                                                               |
