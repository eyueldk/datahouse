import { paginate, unwrapData } from "../utils";
import type { EdenFetchClient } from "../utils/eden.ts";

export interface ExtractorInfo {
  id: string;
  cron?: string;
  schema: object;
}

export class ExtractorsClient {
  constructor(private client: EdenFetchClient) {}

  async list(
    params: {
      limit?: number;
      offset?: number;
    } = {},
  ) {
    const response = await this.client("/api/extractors", {
      method: "GET",
      query: {
        limit: params.limit,
        offset: params.offset,
      },
    });
    return unwrapData(response, "Failed to list extractors");
  }

  pages(
    params: {
      limit?: number;
      offset?: number;
    } = {},
  ) {
    return paginate(
      ({ limit, offset }) => this.list({ limit, offset }),
      params,
    );
  }
}
