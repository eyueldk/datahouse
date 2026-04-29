import { unwrapData } from "../utils";
import type { EdenFetchClient } from "../utils/eden.ts";
import type { AnyCollection } from "@datahousejs/core";
import type {
  CollectionDataByIdFromCollection,
  CollectionIdFromCollection,
  DatawarehouseRecord,
  DatawarehouseTombstone,
  PaginatedResponse,
} from "../types";

export class DatawarehouseCollectionsClient {
  constructor(private client: EdenFetchClient) {}

  async list() {
    const response = await this.client("/api/datawarehouse-collections", { method: "GET" });
    return unwrapData(response, "Failed to list datawarehouse collections");
  }
}

export class DatawarehouseTombstonesClient<TCollection extends AnyCollection> {
  constructor(private client: EdenFetchClient) {}

  async *pages<
    const TCollectionId extends CollectionIdFromCollection<TCollection>,
  >(params: {
    collection: TCollectionId;
    since?: Date | null;
    limit?: number;
    offset?: number;
  }) {
    let offset = params.offset;
    while (true) {
      const response = await this.client("/api/datawarehouse-tombstones", {
        method: "POST",
        body: {
          collection: params.collection,
          since: params.since ?? undefined,
          limit: params.limit,
          offset,
        },
      });
      const page = unwrapData(
        response,
        "Failed to list datawarehouse tombstones",
      );
      if (page.items.length === 0) {
        break;
      }
      yield page;
      offset = page.meta.offset + page.items.length;
      if (offset >= page.meta.total) {
        break;
      }
    }
  }
}

export class DatawarehouseRecordsClient<TCollection extends AnyCollection> {
  constructor(private client: EdenFetchClient) {}

  async list<
    const TCollectionId extends CollectionIdFromCollection<TCollection>,
  >(params: {
    collection: TCollectionId;
    since?: Date | null;
    limit?: number;
    offset?: number;
  }): Promise<
    PaginatedResponse<
      DatawarehouseRecord<
        CollectionDataByIdFromCollection<TCollection, TCollectionId>,
        TCollectionId
      >
    >
  > {
    const response = await this.client("/api/datawarehouse-records", {
      method: "POST",
      body: {
        collection: params.collection,
        since: params.since ?? undefined,
        limit: params.limit,
        offset: params.offset,
      },
    });
    return unwrapData(
      response,
      "Failed to list datawarehouse records",
    ) as PaginatedResponse<
      DatawarehouseRecord<
        CollectionDataByIdFromCollection<TCollection, TCollectionId>,
        TCollectionId
      >
    >;
  }

  async *pages<
    const TCollectionId extends CollectionIdFromCollection<TCollection>,
  >(params: {
    collection: TCollectionId;
    since?: Date | null;
    limit?: number;
    offset?: number;
  }) {
    let offset = params.offset;
    while (true) {
      const page = await this.list({
        collection: params.collection,
        since: params.since,
        limit: params.limit,
        offset,
      });
      if (page.items.length === 0) {
        break;
      }
      yield page;
      offset = page.meta.offset + page.items.length;
      if (offset >= page.meta.total) {
        break;
      }
    }
  }

  async delete(params: { id: string }) {
    const response = await this.client("/api/datawarehouse-records/:id", {
      method: "DELETE",
      params: { id: params.id },
    });
    return unwrapData(
      response,
      `Failed to delete datawarehouse record ${params.id}`,
    );
  }
}
