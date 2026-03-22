import type { DataHouse } from "@datahouse/core";
import type { TreatyClient } from "../internal/treaty";
import { unwrapData } from "../internal/result";
import type {
  CollectionDataById,
  CollectionIdFromConfig,
  PaginatedResponse,
  RecordRow,
} from "../types";

export function createRecordsApi<
  TConfig extends DataHouse<unknown>,
>(params: { client: TreatyClient }) {
  const { client } = params;

  async function list<
    TCollection extends CollectionIdFromConfig<TConfig>,
  >(params: {
    collection: TCollection;
    limit?: number;
    offset?: number;
  }): Promise<
    PaginatedResponse<
      RecordRow<CollectionDataById<TConfig, TCollection>, TCollection>
    >
  >;
  async function list(params?: {
    collection?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<RecordRow<unknown, string>>>;
  async function list(
    params: {
      collection?: string;
      limit?: number;
      offset?: number;
    } = {},
  ) {
    const response = await client.api.records.get({
      query: {
        collection: params.collection,
        limit: params.limit,
        offset: params.offset,
      },
    });
    return unwrapData(response, "Failed to list records");
  }

  return {
    list,

    async *iterate<
      TCollection extends CollectionIdFromConfig<TConfig>,
    >(params: { collection: TCollection; limit?: number; offset?: number }) {
      const limit = params.limit;
      let offset = params.offset ?? 0;

      while (true) {
        const page = await list({
          collection: params.collection,
          limit,
          offset,
        });
        if (page.items.length === 0) {
          break;
        }
        for (const item of page.items) {
          yield item;
        }
        offset += page.items.length;
        if (offset >= page.meta.total) {
          break;
        }
      }
    },
  };
}
