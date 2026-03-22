import type { z } from "zod";
import type { AnyCollection } from "./collection";
import type { Extractor } from "./extractor";
import type { UploadedFile } from "./file";
export type CollectionData<TCollection extends AnyCollection, TId extends string> = TCollection extends {
    id: TId;
    schema: infer TSchema extends z.ZodType;
} ? z.infer<TSchema> : never;
export type EmitTransformFn<TCollection extends AnyCollection> = <TId extends TCollection["id"]>(collection: TId, items: Array<{
    key: string;
    data: CollectionData<TCollection, TId>;
}>) => Promise<void>;
export interface TransformContext<TInput, TCollection extends AnyCollection> {
    data: TInput;
    upload: (params: {
        content: File | Blob | ArrayBuffer;
        name?: string;
        mimeType?: string;
    }) => Promise<UploadedFile>;
    download: (params: {
        id: string;
    }) => Promise<ArrayBuffer>;
    emit: EmitTransformFn<TCollection>;
}
type ExtractorData<TExtractor> = TExtractor extends Extractor<infer TData, any, any, any> ? TData : never;
export type TransformFunction<TInput, TCollection extends AnyCollection> = (context: TransformContext<TInput, TCollection>) => void | Promise<void>;
export interface Transformer<TExtractor, TCollection extends AnyCollection> {
    id: string;
    extractor: TExtractor;
    collections: readonly TCollection[];
    transform: TransformFunction<ExtractorData<TExtractor>, TCollection>;
}
export interface CreateTransformerOptions<TExtractor, TCollections extends readonly AnyCollection[]> {
    id: string;
    extractor: TExtractor;
    collections: TCollections;
    transform: TransformFunction<ExtractorData<TExtractor>, TCollections[number]>;
}
export declare function createTransformer<TExtractor, const TCollections extends readonly AnyCollection[]>(options: CreateTransformerOptions<TExtractor, TCollections>): Transformer<TExtractor, TCollections[number]>;
export {};
