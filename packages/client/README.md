# @datahousejs/client

Typed Datahouse client built on Elysia Treaty. Types inferred from your `createDatahouse` config.

## Usage

```ts
import { createClient } from "@datahousejs/client";
import datahouse from "./datahouse.config";

const client = createClient({
  domain: "http://localhost:2510",
  datahouse,
});

// Iterate paginated results
for await (const page of client.datawarehouse.records({
  collection: "books",
})) {
  console.log(page.items);
}

// Direct fetch
const record = await client.datawarehouse.record({
  collection: "books",
  key: "my-key",
});
```

Requires TypeScript 5+.
