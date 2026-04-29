import { unwrapData } from "../utils";
import type { EdenFetchClient } from "../utils/eden.ts";

export class FilesClient {
  constructor(private client: EdenFetchClient) {}

  async list(params: {
    kind?: "datalake" | "datawarehouse";
    recordId?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    const response = await this.client("/api/files", {
      method: "GET",
      query: {
        kind: params.kind,
        recordId: params.recordId,
        limit: params.limit,
        offset: params.offset,
      },
    });
    return unwrapData(
      response,
      "Failed to list files",
    );
  }

  async *pages(params?: {
    kind?: "datalake" | "datawarehouse";
    recordId?: string;
    limit?: number;
    offset?: number;
  }) {
    let offset = params?.offset;
    while (true) {
      const page = await this.list({
        kind: params?.kind,
        recordId: params?.recordId,
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

  async download(params: { id: string }) {
    const response = await this.client("/api/files/:id/download", {
      method: "GET",
      params,
    });
    return unwrapData(response, `Failed to download file ${params.id}`);
  }
}
