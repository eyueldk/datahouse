import { paginate, unwrapData } from "../utils";
import type { EdenFetchClient } from "../utils/eden.ts";

export type RunType = "extract" | "transform";
export type RunStatus = "running" | "completed" | "failed";

export interface RunRecord {
  id: string;
  type: RunType;
  status: RunStatus;
  error: string | null;
  startedAt: Date;
  completedAt: Date | null;
}

export class RunsClient {
  constructor(private client: EdenFetchClient) {}

  async list(
    params: {
      type?: RunType;
      limit?: number;
      offset?: number;
    } = {},
  ) {
    const response = await this.client("/api/runs", {
      method: "GET",
      query: {
        type: params.type,
        limit: params.limit,
        offset: params.offset,
      },
    });
    return unwrapData(response, "Failed to list runs");
  }

  pages(
    params: {
      type?: RunType;
      limit?: number;
      offset?: number;
    } = {},
  ) {
    const { type, limit: pageLimit, offset: startOffset } = params;
    return paginate(
      ({ limit, offset }) => this.list({ type, limit, offset }),
      { limit: pageLimit, offset: startOffset },
    );
  }

  async get(params: { id: string }) {
    const response = await this.client("/api/runs/:id", {
      method: "GET",
      params: { id: params.id },
    });
    return unwrapData(response, `Failed to get run ${params.id}`);
  }
}
