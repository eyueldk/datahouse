import { edenFetch } from "@elysiajs/eden/fetch";
import type { EdenFetch } from "@elysiajs/eden/fetch";
import type { Server } from "@datahousejs/server";

export type EdenFetchClient = EdenFetch.Create<Server>;

export function createEdenFetchClient(params: { baseUrl: string }): EdenFetchClient {
  return edenFetch<Server>(params.baseUrl);
}
