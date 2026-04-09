import type { AnyDatahouse } from "@datahousejs/core";
import { createDatalakeClient, type DatalakeClient } from "./apis/datalake";
import {
  createDatawarehouseClient,
  type DatawarehouseClient,
} from "./apis/datawarehouse";
import {
  createExtractorsClient,
  type ExtractorsClient,
} from "./apis/extractors";
import { createRunsClient, type RunsClient } from "./apis/runs";
import { createSourcesClient, type SourcesClient } from "./apis/sources";
import {
  createTransformersClient,
  type TransformersClient,
} from "./apis/transformers";
import { createTreatyClient } from "./utils/treaty.ts";
import type { CollectionFromDatahouse } from "./types";

export interface DatahouseClient<TDatahouse extends AnyDatahouse> {
  readonly datalake: DatalakeClient;
  readonly extractors: ExtractorsClient;
  readonly runs: RunsClient;
  readonly sources: SourcesClient;
  readonly transformers: TransformersClient;
  readonly datawarehouse: DatawarehouseClient<CollectionFromDatahouse<TDatahouse>>;
}

export function createDatahouseClient<const TDatahouse extends AnyDatahouse>(params: {
  domain: string;
}): DatahouseClient<TDatahouse> {
  const transport = createTreatyClient(params);
  return {
    datalake: createDatalakeClient(transport),
    extractors: createExtractorsClient(transport),
    runs: createRunsClient(transport),
    sources: createSourcesClient(transport),
    transformers: createTransformersClient(transport),
    datawarehouse: createDatawarehouseClient<CollectionFromDatahouse<TDatahouse>>(
      transport,
    ),
  };
}
