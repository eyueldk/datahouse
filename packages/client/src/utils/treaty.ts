import { treaty, type Treaty } from "@elysiajs/eden";
import type { Server } from "@datahousejs/server";

/** Eden client typed against the server server. */
export type TreatyClient = Treaty.Create<Server>;

export function createTreatyClient(params: { domain: string }): TreatyClient {
  return treaty<Server>(params.domain);
}
