# @datahouse/client

**Not published.** Ships with the **`datahouse`** package; import from **`datahouse/client`** (or use this path inside the monorepo).

Typed Datahouse client built on top of Elysia Treaty. Transport is Eden-typed to the runtime **Server**; **collection and `data` payloads** are inferred from your **`createDatahouse(...)`** config (same idea as `treaty<Server>`, but domain types come from your pipelines).

## Usage

**Infer types from your config (recommended):**

```ts
import { createClient } from "datahouse/client";
import datahouse from "./index"; // your createDatahouse({ pipelines: [...] }) export

const client = createClient({
  domain: "http://localhost:2510",
  datahouse,
});

for await (const page of client.datawarehouse.records({
  collection: "books",
  limit: 50,
})) {
  // page.items[].data is inferred from the "books" Zod schema
  console.log(page.items);
}
```

**Or** pass an explicit generic if you do not want a `datahouse` property at runtime:

```ts
const client = createClient<typeof datahouse>({
  domain: "http://localhost:2510",
});
```

Requires **TypeScript 5+** (`const` type parameters on `records` / `tombstones`).
