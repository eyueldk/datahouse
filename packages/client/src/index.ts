import type { AnyDatahouse } from "@datahouse/core";
import {
  createDatahouseClient,
  type DatahouseClient,
} from "./client";

export type { DatahouseClient };

/**
 * Typed Datahouse HTTP client. Types follow your **Datahouse** config (collections + Zod schemas).
 *
 * **Inference (recommended):** pass your `createDatahouse({ pipelines: [...] })` result as `datahouse`
 * so `client.datawarehouse.records({ collection: "books" })` narrows `page.items[].data` automatically.
 *
 * **Explicit generic:** `createClient<typeof myDatahouse>({ domain: "…" })` when you omit `datahouse`.
 */
export function createClient<const TDatahouse extends AnyDatahouse = AnyDatahouse>(
  params: {
    domain: string;
    /** Pass the same object you gave `createDatahouse(...)` to infer collection ids and record payloads. */
    datahouse?: TDatahouse;
  },
): DatahouseClient<TDatahouse> {
  return createDatahouseClient<TDatahouse>({ domain: params.domain });
}
