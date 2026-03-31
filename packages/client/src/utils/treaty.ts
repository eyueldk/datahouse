import { treaty, type Treaty } from "@elysiajs/eden";
import type { Server } from "@datahouse/runtime";

/** Eden client typed against the runtime server. */
export type TreatyClient = Treaty.Create<Server>;

export function createTreatyClient(params: { domain: string }): TreatyClient {
  return treaty<Server>(params.domain);
}
