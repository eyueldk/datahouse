# @datahouse/client

Typed Datahouse client built on Elysia Treaty. Types inferred from your `createDatahouse` config.

## Usage

```ts
import { createClient } from "@datahouse/client";
import datahouse from "./index";

const client = createClient({
  domain: "http://localhost:2510",
  datahouse,
});

for await (const page of client.datawarehouse.records({
  collection: "books",
})) {
  console.log(page.items);
}
```

Requires TypeScript 5+.
