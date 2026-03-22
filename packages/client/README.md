# @datahouse/client

Typed DataHouse client built on top of Elysia Treaty.

## Usage

```ts
import config from "example/src";
import { createClient } from "@datahouse/client";

const client = createClient<typeof config>({
  domain: "http://localhost:2510",
});

const result = await client.records.list({
  collection: "books",
});
```
