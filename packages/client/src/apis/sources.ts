import { paginate, unwrapData } from "../utils";
import type { TreatyClient } from "../utils/treaty.ts";
import type { PaginatedResponse } from "../types";

export interface ExtractSourceResult {
  sourceId: string;
  jobId: string;
}

export interface SourceRecord {
  id: string;
  extractorId: string;
  key: string;
  config: unknown;
  cursor: unknown;
  schema: unknown;
  createdAt: Date;
}

export interface SourcesClient {
  list(
    params?: {
      extractorId?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<PaginatedResponse<SourceRecord>>;
  pages(
    params?: {
      extractorId?: string;
      limit?: number;
      offset?: number;
    },
  ): AsyncGenerator<PaginatedResponse<SourceRecord>, void, undefined>;
  get(params: { id: string }): Promise<SourceRecord>;
  create(params: {
    extractorId: string;
    config?: unknown;
  }): Promise<SourceRecord>;
  update(params: {
    id: string;
    extractorId?: string;
    key?: string;
    config?: unknown;
    cursor?: unknown;
  }): Promise<SourceRecord>;
  remove(params: { id: string }): Promise<void>;
  extract(params: { id: string }): Promise<ExtractSourceResult>;
}

export function createSourcesClient(client: unknown): SourcesClient {
  const tc = client as TreatyClient;
  return {
    async list(params = {}) {
      const response = await tc.api.sources.get({
        query: {
          extractorId: params.extractorId,
          limit: params.limit,
          offset: params.offset,
        },
      });
      return unwrapData(response, "Failed to list sources");
    },
    pages(params = {}) {
      return paginate(
        ({ limit, offset }) =>
          this.list({
            extractorId: params.extractorId,
            limit,
            offset,
          }),
        params,
      );
    },
    async get(params) {
      const response = await tc.api.sources({ id: params.id }).get();
      return unwrapData(response, `Failed to get source ${params.id}`);
    },
    async create(params) {
      const response = await tc.api.sources.post(params);
      return unwrapData(response, "Failed to create source");
    },
    async update(params) {
      const { id, ...body } = params;
      const response = await tc.api.sources({ id }).patch(body);
      return unwrapData(response, `Failed to update source ${id}`);
    },
    async remove(params) {
      const response = await tc.api.sources({ id: params.id }).delete();
      if (response.error) {
        throw new Error(
          `Failed to delete source ${params.id} (status ${response.error.status}): ${JSON.stringify(response.error.value)}`,
        );
      }
    },
    async extract(params) {
      const response = await tc.api
        .sources({ id: params.id })
        .extract.post();
      return unwrapData(response, `Failed to enqueue extract for source ${params.id}`);
    },
  };
}
