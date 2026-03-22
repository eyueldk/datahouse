import type { TreatyClient } from "../internal/treaty";
import { unwrapData } from "../internal/result";

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

export function createRunsApi(params: { client: TreatyClient }) {
  const { client } = params;

  const list = async (
    params: {
      type?: RunType;
      limit?: number;
      offset?: number;
    } = {},
  ) => {
    const response = await client.api.runs.get({
      query: {
        type: params.type,
        limit: params.limit,
        offset: params.offset,
      },
    });
    return unwrapData(response, "Failed to list runs");
  };

  return {
    list,

    async *iterate(
      params: {
        type?: RunType;
        limit?: number;
        offset?: number;
      } = {},
    ) {
      const limit = params.limit;
      let offset = params.offset ?? 0;

      while (true) {
        const page = await list({
          type: params.type,
          limit,
          offset,
        });
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

    async get(params: { id: string }) {
      const response = await client.api.runs({ id: params.id }).get();
      return unwrapData(response, `Failed to get run ${params.id}`);
    },
  };
}
