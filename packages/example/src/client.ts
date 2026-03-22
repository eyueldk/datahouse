import { createClient } from "@datahouse/client";
import config from "./index";

export const client = createClient<typeof config>({
  domain: "http://localhost:2510",
});

export async function listBookRecords() {
  return client.records.list({
    collection: "books",
  });
}
