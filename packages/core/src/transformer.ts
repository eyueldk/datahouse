import type { z } from "zod";
import type { AnyCollection, ZodSchema } from "./collection";
import type { AnyExtractor, ExtractorData } from "./extractor";
import type { UploadedFile } from "./file";

/** Flattens object types for cleaner tooltips (no nested intersections). */
type Prettify<T> = { [K in keyof T]: T[K] } & {};

/** Row shape for a collection (Zod schema output). */
export type CollectionData<
  TCollection extends AnyCollection,
  TId extends string,
> = [Extract<TCollection, { id: TId }>] extends [never]
  ? never
  : Prettify<z.infer<Extract<TCollection, { id: TId }>["schema"]>>;

/**
 * One chunk yielded by a transform (per collection). Mirrors {@link ExtractBatch} on the extractor side.
 */
export type TransformBatch<TCollection extends AnyCollection> = {
  [K in TCollection["id"]]: {
    collection: K;
    items: Array<{ key: string; data: CollectionData<TCollection, K> }>;
  };
}[TCollection["id"]];

export interface TransformContext<TInput> {
  data: TInput;
  upload: (params: {
    content: Buffer;
    name?: string;
    mimeType?: string;
  }) => Promise<UploadedFile>;
  download: (params: { id: string }) => Promise<Buffer>;
}

export type TransformGeneratorFunction<
  TInput,
  TCollection extends AnyCollection = AnyCollection,
> = (
  context: TransformContext<TInput>,
) => AsyncGenerator<TransformBatch<TCollection>, void, void>;

export interface Transformer<TExtractor, TCollection extends AnyCollection> {
  id: string;
  extractor: TExtractor;
  collections: readonly TCollection[];
  transform: TransformGeneratorFunction<ExtractorData<TExtractor>, TCollection>;
}

/** Widened transformer for generic constraints (e.g. `AnyPipeline`). */
export type AnyTransformer = Transformer<AnyExtractor, AnyCollection>;

export interface CreateTransformerOptions<
  TExtractor,
  TCollections extends readonly { id: string; schema: ZodSchema }[],
> {
  id: string;
  extractor: TExtractor;
  collections: TCollections;
  transform: TransformGeneratorFunction<
    ExtractorData<TExtractor>,
    TCollections[number]
  >;
}

export function createTransformer<
  TExtractor,
  const TCollections extends readonly AnyCollection[],
>(
  options: CreateTransformerOptions<TExtractor, TCollections>,
): Transformer<TExtractor, TCollections[number]> {
  return {
    id: options.id,
    transform: options.transform,
    extractor: options.extractor,
    collections: options.collections,
  };
}
