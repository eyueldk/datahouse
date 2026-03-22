import type { TreatyClient } from "../internal/treaty";
import { unwrapData } from "../internal/result";

export interface SourceRecord {
  id: string;
  extractorId: string;
  key: string;
  config: unknown;
  cursor: unknown;
  schema: unknown;
  createdAt: Date;
}

export function createSourcesApi(params: { client: TreatyClient }) {
  const { client } = params;

  const list = async (
    params: {
      extractorId?: string;
      limit?: number;
      offset?: number;
    } = {},
  ) => {
    const response = await client.api.sources.get({
      query: {
        extractorId: params.extractorId,
        limit: params.limit,
        offset: params.offset,
      },
    });
    return unwrapData(response, "Failed to list sources");
  };

  return {
    list,

    async *iterate(
      params: {
        extractorId?: string;
        limit?: number;
        offset?: number;
      } = {},
    ) {
      const limit = params.limit;
      let offset = params.offset ?? 0;

      while (true) {
        const page = await list({
          extractorId: params.extractorId,
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

    async get(params: { id: string }) {
      const response = await client.api.sources({ id: params.id }).get();
      return unwrapData(response, `Failed to get source ${params.id}`);
    },

    async create(params: { extractorId: string; config?: unknown }) {
      const response = await client.api.sources.post(params);
      return unwrapData(response, "Failed to create source");
    },

    async update(params: {
      id: string;
      extractorId?: string;
      key?: string;
      config?: unknown;
      cursor?: unknown;
    }) {
      const { id, ...body } = params;
      const response = await client.api.sources({ id }).patch(body);
      return unwrapData(response, `Failed to update source ${id}`);
    },

    async remove(params: { id: string }): Promise<void> {
      const response = await client.api.sources({ id: params.id }).delete();
      if (response.error) {
        throw new Error(
          `Failed to delete source ${params.id} (status ${response.error.status}): ${JSON.stringify(response.error.value)}`,
        );
      }
    },

    async trigger(params: { id: string }) {
      const response = await client.api
        .sources({ id: params.id })
        .trigger.post();
      return unwrapData(response, `Failed to trigger source ${params.id}`);
    },
  };
}
