import { unwrapData } from "../utils";
import type { EdenFetchClient } from "../utils/eden.ts";
import type { DatalakeRecord, PaginatedResponse } from "../types";

export interface TriggerDatalakeTransformsResult {
  jobId: string;
  enqueued: number;
  runIds: string[];
}

export class DatalakeRecordsClient {
  constructor(private client: EdenFetchClient) {}

  async list(params: {
    extractorId?: string;
    sourceId?: string;
    since?: Date;
    limit?: number;
    offset?: number;
  } = {}) {
    const response = await this.client("/api/datalake-records", {
      method: "GET",
      query: {
        extractorId: params.extractorId,
        sourceId: params.sourceId,
        since: params.since,
        limit: params.limit,
        offset: params.offset,
      },
    });
    return unwrapData(
      response,
      "Failed to list datalake records",
    );
  }

  async delete(params: { id: string }) {
    const response = await this.client("/api/datalake-records/:id", {
      method: "DELETE",
      params: { id: params.id },
    });
    return unwrapData(response, `Failed to delete datalake record ${params.id}`);
  }

  async *pages(params?: {
    extractorId?: string;
    sourceId?: string;
    since?: Date;
    limit?: number;
    offset?: number;
  }) {
    let offset = params?.offset;
    while (true) {
      const page = await this.list({
        extractorId: params?.extractorId,
        sourceId: params?.sourceId,
        since: params?.since,
        limit: params?.limit,
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

  async transform(params: { id: string; transformerIds?: string[] }) {
    const response = await this.client("/api/datalake-records/:id/transform", {
      method: "POST",
      params: { id: params.id },
      body: {
        transformerIds: params.transformerIds,
      },
    });
    return unwrapData(
      response,
      `Failed to trigger transforms for datalake ${params.id}`,
    );
  }
}
