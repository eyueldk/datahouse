import { unwrapData } from "../utils";
import type { EdenFetchClient } from "../utils/eden.ts";

export class VersionClient {
  constructor(private client: EdenFetchClient) {}

  async get() {
    const response = await this.client("/api/version", { method: "GET" });
    return unwrapData(response, "Failed to get API version");
  }
}
