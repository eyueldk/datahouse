import type { z } from "zod";

export interface Collection<
  TId extends string = string,
  TSchema extends z.ZodType = z.ZodType,
> {
  id: TId;
  schema: TSchema;
}

export type AnyCollection = Collection<string, z.ZodType>;

export interface CreateCollectionOptions<
  TId extends string,
  TSchema extends z.ZodType,
> {
  id: TId;
  schema: TSchema;
}

export function createCollection<TId extends string, TSchema extends z.ZodType>(
  options: CreateCollectionOptions<TId, TSchema>,
): Collection<TId, TSchema> {
  return {
    id: options.id,
    schema: options.schema,
  };
}
