import type { TreatyClient } from "../internal/treaty";
import { unwrapData } from "../internal/result";

export interface ExtractorInfo {
  id: string;
  cron?: string;
  schema: unknown;
}

export function createExtractorsApi(params: { client: TreatyClient }) {
  const { client } = params;

  const list = async (
    params: {
      limit?: number;
      offset?: number;
    } = {},
  ) => {
    const response = await client.api.extractors.get({
      query: {
        limit: params.limit,
        offset: params.offset,
      },
    });
    return unwrapData(response, "Failed to list extractors");
  };

  return {
    list,

    async *iterate(params: { limit?: number; offset?: number } = {}) {
      const limit = params.limit;
      let offset = params.offset ?? 0;

      while (true) {
        const page = await list({ limit, offset });
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
