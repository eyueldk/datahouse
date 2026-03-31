import { unwrapData } from "../utils";
import type { TreatyClient } from "../utils/treaty.ts";

export interface TransformerRef {
  id: string;
}

export interface TransformersClient {
  list(params?: { extractorId?: string }): Promise<{ items: TransformerRef[] }>;
}

export function createTransformersClient(client: unknown): TransformersClient {
  const tc = client as TreatyClient;
  return {
    async list(params = {}) {
      const response = await tc.api.transformers.get({
        query: {
          extractorId: params.extractorId,
        },
      });
      return unwrapData(response, "Failed to list transformers");
    },
  };
}
