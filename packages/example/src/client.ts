import { createClient } from "@datahousejs/client";
import type {
  CollectionDataById,
  CollectionFromDatahouse,
  CollectionIdFromDatahouse,
  Prettify,
} from "@datahousejs/client/types";
import datahouse from "./index";

export type ExampleCollectionIds = CollectionIdFromDatahouse<typeof datahouse>;

export type ExampleAllCollections = Prettify<
  CollectionFromDatahouse<typeof datahouse>
>;

export type ExampleDatawarehouseDataByCollectionId = {
  [K in CollectionIdFromDatahouse<typeof datahouse>]: Prettify<
    CollectionDataById<typeof datahouse, K>
  >;
};

export const client = createClient({
  domain: "http://localhost:2510",
  datahouse,
});

export async function listBookRows() {
  for await (const page of client.datawarehouse.records({
    collection: "books",
    limit: 50,
  })) {
    return page;
  }
  return {
    items: [],
    meta: { offset: 0, limit: 50, total: 0 },
  };
}

export async function listAllBookRows() {
  const rows = [];
  for await (const page of client.datawarehouse.records({
    collection: "books",
  })) {
    for (const row of page.items) {
      rows.push(row.data);
    }
  }
  return rows;
}
