import { paginate, unwrapData } from "../utils";
import type { EdenFetchClient } from "../utils/eden.ts";

export interface ExtractSourceResult {
  sourceId: string;
  jobId: string;
}

export interface SourceRecord {
  id: string;
  extractorId: string;
  key: string;
  config: object;
  cursor: object;
  /** Config JSON Schema from the runtime extractor. */
  schema?: object;
  createdAt: Date;
}

export class SourcesClient {
  constructor(private client: EdenFetchClient) {}

  async list(
    params: {
      extractorId?: string;
      limit?: number;
      offset?: number;
    } = {},
  ) {
    const response = await this.client("/api/sources", {
      method: "GET",
      query: {
        extractorId: params.extractorId,
        limit: params.limit,
        offset: params.offset,
      },
    });
    return unwrapData(response, "Failed to list sources");
  }

  pages(
    params: {
      extractorId?: string;
      limit?: number;
      offset?: number;
    } = {},
  ) {
    return paginate(
      ({ limit, offset }) =>
        this.list({
          extractorId: params.extractorId,
          limit,
          offset,
        }),
      params,
    );
  }

  async get(params: { id: string }) {
    const response = await this.client("/api/sources/:id", {
      method: "GET",
      params: { id: params.id },
    });
    return unwrapData(response, `Failed to get source ${params.id}`);
  }

  async create(params: { extractorId: string; config: unknown }) {
    const response = await this.client("/api/sources", {
      method: "POST",
      body: params,
    });
    return unwrapData(response, "Failed to create source");
  }

  async update(params: {
    id: string;
    extractorId?: string;
    key?: string;
    config?: unknown;
    cursor?: unknown;
  }) {
    const { id, ...body } = params;
    const response = await this.client("/api/sources/:id", {
      method: "PATCH",
      params: { id },
      body,
    });
    return unwrapData(response, `Failed to update source ${id}`);
  }

  async delete(params: { id: string }) {
    const response = await this.client("/api/sources/:id", {
      method: "DELETE",
      params: { id: params.id },
    });
    return unwrapData(response, `Failed to delete source ${params.id}`);
  }

  async extract(params: { id: string }) {
    const response = await this.client("/api/sources/:id/extract", {
      method: "POST",
      params: { id: params.id },
    });
    return unwrapData(
      response,
      `Failed to enqueue extract for source ${params.id}`,
    );
  }
}
