import { unwrapData } from "../utils";
import type { TreatyClient } from "../utils/treaty.ts";
import type { DatalakeRecord, PaginatedResponse } from "../types";

export interface TriggerDatalakeTransformsResult {
  jobId: string;
  enqueued: number;
  runIds: string[];
}

export interface DatalakeClient {
  list(params: {
    extractorId?: string;
    sourceId?: string;
    since?: Date;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<DatalakeRecord>>;
  pages(params?: {
    extractorId?: string;
    sourceId?: string;
    since?: Date;
    limit?: number;
    offset?: number;
  }): AsyncGenerator<PaginatedResponse<DatalakeRecord>, void, undefined>;
  transform(params: {
    id: string;
    transformerIds?: string[];
  }): Promise<TriggerDatalakeTransformsResult>;
}

export function createDatalakeClient(client: TreatyClient): DatalakeClient {
  return {
    async list(params) {
      const response = await client.api.datalake.get({
        query: {
          extractorId: params.extractorId,
          sourceId: params.sourceId,
          since: params.since,
          limit: params.limit,
          offset: params.offset,
        },
      });
      return unwrapData(response, "Failed to list datalake records");
    },
    async *pages(params) {
      const limit = params?.limit;
      let offset = params?.offset ?? 0;
      while (true) {
        const page = await this.list({
          extractorId: params?.extractorId,
          sourceId: params?.sourceId,
          since: params?.since,
          limit,
          offset,
        });
        if (page.items.length === 0) {
          break;
        }
        yield page;
        offset += page.items.length;
        if (offset >= page.meta.total) {
          break;
        }
      }
    },
    async transform(params) {
      const response = await client.api
        .datalake({ id: params.id })
        .transform.post({
          transformerIds: params.transformerIds,
        });
      return unwrapData(
        response,
        `Failed to trigger transforms for datalake ${params.id}`,
      );
    },
  };
}
