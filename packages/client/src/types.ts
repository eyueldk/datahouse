import type { DataHouse } from "@datahouse/core";
import type { z } from "zod";

export type PipelineFromConfig<TConfig extends DataHouse<unknown>> =
  TConfig["pipelines"] extends readonly (infer TPipeline)[] ? TPipeline : never;

export type CollectionFromPipeline<TPipeline> = TPipeline extends {
  transformer: { collections: readonly (infer TCollection)[] };
}
  ? TCollection
  : never;

export type CollectionFromConfig<TConfig extends DataHouse<unknown>> =
  CollectionFromPipeline<PipelineFromConfig<TConfig>>;

export type CollectionIdFromConfig<TConfig extends DataHouse<unknown>> =
  CollectionFromConfig<TConfig> extends { id: infer TId extends string }
    ? TId
    : never;

export type CollectionById<
  TConfig extends DataHouse<unknown>,
  TCollectionId extends CollectionIdFromConfig<TConfig>,
> = Extract<CollectionFromConfig<TConfig>, { id: TCollectionId }>;

export type CollectionDataById<
  TConfig extends DataHouse<unknown>,
  TCollectionId extends CollectionIdFromConfig<TConfig>,
> =
  CollectionById<TConfig, TCollectionId> extends {
    schema: infer TSchema extends z.ZodType;
  }
    ? z.infer<TSchema>
    : never;

export interface RecordRow<TData, TCollectionId extends string> {
  id: string;
  runId: string;
  bronzeRecordId: string;
  transformerId: string;
  collection: TCollectionId;
  key: string;
  data: TData;
  createdAt: Date;
}

export interface PaginationMeta {
  offset: number;
  limit: number;
  total: number;
}

export interface PaginatedResponse<TItem> {
  items: TItem[];
  meta: PaginationMeta;
}
