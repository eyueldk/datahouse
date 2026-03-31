import { unwrapData } from "../utils";
import type { TreatyClient } from "../utils/treaty.ts";
import type { AnyCollection } from "@datahouse/core";
import type {
  CollectionDataByIdFromCollection,
  CollectionIdFromCollection,
  DatawarehouseRecord,
  DatawarehouseTombstone,
  PaginatedResponse,
} from "../types";

export interface DatawarehouseClient<
  TCollection extends AnyCollection,
> {
  /** Distinct collection ids from live datawarehouse rows and tombstones. */
  collections(): Promise<{ items: string[] }>;

  tombstones<const TCollectionId extends CollectionIdFromCollection<TCollection>>(
    params: {
      collection: TCollectionId;
      since?: Date | null;
      limit?: number;
      offset?: number;
    },
  ): AsyncGenerator<
    PaginatedResponse<DatawarehouseTombstone>,
    void,
    undefined
  >;

  records<const TCollectionId extends CollectionIdFromCollection<TCollection>>(
    params: {
      collection: TCollectionId;
      since?: Date | null;
      limit?: number;
      offset?: number;
    },
  ): AsyncGenerator<
    PaginatedResponse<
      DatawarehouseRecord<
        CollectionDataByIdFromCollection<TCollection, TCollectionId>,
        TCollectionId
      >
    >,
    void,
    undefined
  >;
}

export function createDatawarehouseClient<
  const TCollection extends AnyCollection,
>(
  client: unknown,
): DatawarehouseClient<TCollection> {
  const tc = client as TreatyClient;

  async function collections(): Promise<{ items: string[] }> {
    const response = await tc.api.datawarehouse.collections.get();
    return unwrapData(
      response,
      "Failed to list datawarehouse collections",
    ) as { items: string[] };
  }

  function tombstones<
    const TCollectionId extends CollectionIdFromCollection<TCollection>
  >(
    params: {
      collection: TCollectionId;
      since?: Date | null;
      limit?: number;
      offset?: number;
    },
  ): AsyncGenerator<
    PaginatedResponse<DatawarehouseTombstone>,
    void,
    undefined
  > {
    return (async function* () {
      const limit = params.limit ?? 50;
      let offset = params.offset ?? 0;
      while (true) {
        const response = await tc.api.datawarehouse.tombstones.post({
          collection: params.collection,
          since: params.since ?? undefined,
          limit,
          offset,
        });
        const page = unwrapData(
          response,
          "Failed to list datawarehouse tombstones",
        ) as PaginatedResponse<DatawarehouseTombstone>;
        if (page.items.length === 0) {
          break;
        }
        yield page;
        offset += page.items.length;
        if (offset >= page.meta.total) {
          break;
        }
      }
    })();
  }

  function records<
    const TCollectionId extends CollectionIdFromCollection<TCollection>
  >(
    params: {
      collection: TCollectionId;
      since?: Date | null;
      limit?: number;
      offset?: number;
    },
  ): AsyncGenerator<
    PaginatedResponse<
      DatawarehouseRecord<
        CollectionDataByIdFromCollection<TCollection, TCollectionId>,
        TCollectionId
      >
    >,
    void,
    undefined
  > {
    return (async function* () {
      const limit = params.limit ?? 50;
      let offset = params.offset ?? 0;
      while (true) {
        const response = await tc.api.datawarehouse.records.post({
          collection: params.collection,
          since: params.since ?? undefined,
          limit,
          offset,
        });
        const page = unwrapData(
          response,
          "Failed to list datawarehouse records",
        ) as PaginatedResponse<
          DatawarehouseRecord<
            CollectionDataByIdFromCollection<TCollection, TCollectionId>,
            TCollectionId
          >
        >;
        if (page.items.length === 0) {
          break;
        }
        yield page;
        offset += page.items.length;
        if (offset >= page.meta.total) {
          break;
        }
      }
    })();
  }

  const api = { collections, tombstones, records };
  return api;
}
