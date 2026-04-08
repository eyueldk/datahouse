import { paginate, unwrapData } from "../utils";
import type { TreatyClient } from "../utils/treaty.ts";
import type { PaginatedResponse } from "../types";

export interface ExtractorInfo {
  id: string;
  cron?: string;
  schema: object;
}

export interface ExtractorsClient {
  list(params?: {
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<ExtractorInfo>>;
  pages(params?: {
    limit?: number;
    offset?: number;
  }): AsyncGenerator<PaginatedResponse<ExtractorInfo>, void, undefined>;
}

export function createExtractorsClient(client: TreatyClient): ExtractorsClient {
  return {
    async list(params = {}) {
      const response = await client.api.extractors.get({
        query: {
          limit: params.limit,
          offset: params.offset,
        },
      });
      return unwrapData(response, "Failed to list extractors");
    },
    pages(params = {}) {
      return paginate(
        ({ limit, offset }) => this.list({ limit, offset }),
        params,
      );
    },
  };
}
