import type { AnyDatahouse } from "@datahousejs/core";
import { createDatahouseClient, type DatahouseClient } from "./client";

export * from "./types";
export * from "./apis/sources";
export * from "./apis/extractors";
export * from "./apis/runs";
export * from "./apis/datalake";
export * from "./apis/datawarehouse";
export * from "./apis/transformers";
export type { DatahouseClient };

export function createClient<
  const TDatahouse extends AnyDatahouse = AnyDatahouse,
>(params: { domain: string }): DatahouseClient<TDatahouse> {
  return createDatahouseClient<TDatahouse>({ domain: params.domain });
}
