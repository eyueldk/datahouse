import type { AnyDatahouse } from "@datahousejs/core";
import type { AnyCollection } from "@datahousejs/core";
import type { AnyPipeline } from "@datahousejs/core";
import type { z } from "zod";
import type { FilesClient } from "./apis/files";

/** Flattens intersections so quick-info shows a single object shape. */
export type Prettify<T> = { [K in keyof T]: T[K] } & {};

export type PipelineFromDatahouse<TDatahouse extends AnyDatahouse> =
  TDatahouse["pipelines"][number];

export type CollectionFromPipeline<
  TPipeline extends AnyPipeline,
> = TPipeline["transformer"]["collections"][number];

export type CollectionFromDatahouse<TDatahouse extends AnyDatahouse> =
  CollectionFromPipeline<PipelineFromDatahouse<TDatahouse>>;

export type CollectionIdFromDatahouse<TDatahouse extends AnyDatahouse> =
  CollectionFromDatahouse<TDatahouse>["id"];

export type CollectionIdFromCollection<TCollection extends AnyCollection> =
  TCollection["id"];

export type CollectionByIdFromCollection<
  TCollection extends AnyCollection,
  TCollectionId extends CollectionIdFromCollection<TCollection>,
> = Extract<TCollection, { id: TCollectionId }>;

export type CollectionDataByIdFromCollection<
  TCollection extends AnyCollection,
  TCollectionId extends CollectionIdFromCollection<TCollection>,
> = [CollectionByIdFromCollection<TCollection, TCollectionId>] extends [never]
  ? never
  : Prettify<
      z.infer<
        CollectionByIdFromCollection<TCollection, TCollectionId>["schema"]
      >
    >;

export type CollectionById<
  TDatahouse extends AnyDatahouse,
  TCollectionId extends CollectionIdFromDatahouse<TDatahouse>,
> = Extract<CollectionFromDatahouse<TDatahouse>, { id: TCollectionId }>;

export type CollectionDataById<
  TDatahouse extends AnyDatahouse,
  TCollectionId extends CollectionIdFromDatahouse<TDatahouse>,
> = [CollectionById<TDatahouse, TCollectionId>] extends [never]
  ? never
  : Prettify<z.infer<CollectionById<TDatahouse, TCollectionId>["schema"]>>;

export type DatawarehouseRecord<
  TCollectionData,
  TCollectionId extends string,
> = Prettify<{
  id: string;
  runId: string;
  datalakeId: string;
  transformerId: string;
  collection: TCollectionId;
  key: string;
  data: TCollectionData;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}>;

/** Raw extracted record in the datalake (not tied to a typed collection). */
export type DatalakeRecord = {
  id: string;
  runId: string;
  sourceId: string;
  extractorId: string;
  key: string;
  data: object;
  metadata: Record<string, any>;
  createdAt: Date;
};

/** Uploaded file row returned by the files API. */
export type FileRecord = Awaited<ReturnType<FilesClient["list"]>>["items"][number];

export interface PaginationMeta {
  offset: number;
  limit: number;
  total: number;
}

/** Page of API items, e.g. `PaginatedResponse<DatawarehouseRecord<…, "your-collection-id">>`. */
export type PaginatedResponse<TItem> = {
  items: TItem[];
  meta: PaginationMeta;
};

/** Row shape for `PaginatedResponse<DatawarehouseTombstone>` from tombstones endpoint. */
export type DatawarehouseTombstone = {
  key: string;
  deletedAt: Date;
};
