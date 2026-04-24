import { unwrapData } from "../utils";
import type { EdenFetchClient } from "../utils/eden.ts";

export interface TransformerRef {
  id: string;
}

export class TransformersClient {
  constructor(private client: EdenFetchClient) {}

  async list(
    params: {
      extractorId?: string;
    } = {},
  ) {
    const response = await this.client("/api/transformers", {
      method: "GET",
      query: {
        extractorId: params.extractorId,
      },
    });
    return unwrapData(response, "Failed to list transformers");
  }
}
