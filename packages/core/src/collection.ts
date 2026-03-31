import type { z } from "zod";

/**
 * Not bare `z.ZodType`: Zod 4’s default `Internals` generic causes “excessively deep”
 * checks when TypeScript verifies `T extends z.ZodType` against concrete object schemas.
 */
export type ZodSchema = z.ZodType<any, any, any>;

export interface Collection<TId extends string, TSchema extends ZodSchema> {
  id: TId;
  schema: TSchema;
}

export type AnyCollection = Collection<any, any>;

export interface CreateCollectionOptions<
  TId extends string,
  TSchema extends ZodSchema,
> {
  id: TId;
  schema: TSchema;
}

export function createCollection<TId extends string, TSchema extends ZodSchema>(
  options: CreateCollectionOptions<TId, TSchema>,
): Collection<TId, TSchema> {
  return {
    id: options.id,
    schema: options.schema,
  };
}
