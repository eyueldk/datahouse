import { paginate, unwrapData } from "../utils";
import type { TreatyClient } from "../utils/treaty.ts";
import type { PaginatedResponse } from "../types";

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

export interface RunsClient {
  list(
    params?: {
      type?: RunType;
      limit?: number;
      offset?: number;
    },
  ): Promise<PaginatedResponse<RunRecord>>;
  pages(
    params?: {
      type?: RunType;
      limit?: number;
      offset?: number;
    },
  ): AsyncGenerator<PaginatedResponse<RunRecord>, void, undefined>;
  get(params: { id: string }): Promise<RunRecord>;
}

export function createRunsClient(client: unknown): RunsClient {
  const tc = client as TreatyClient;
  return {
    async list(params = {}) {
      const response = await tc.api.runs.get({
        query: {
          type: params.type,
          limit: params.limit,
          offset: params.offset,
        },
      });
      return unwrapData(response, "Failed to list runs");
    },
    pages(params = {}) {
      const { type, limit: pageLimit, offset: startOffset } = params;
      return paginate(
        ({ limit, offset }) =>
          this.list({ type, limit, offset }),
        { limit: pageLimit, offset: startOffset },
      );
    },
    async get(params) {
      const response = await tc.api.runs({ id: params.id }).get();
      return unwrapData(response, `Failed to get run ${params.id}`);
    },
  };
}
