import type { z } from "zod";
import type { UploadedFile } from "./file";

export type ExtractBatch<TData, TCursor = unknown> = {
  items: Array<{ key: string; data: TData }>;
  cursor?: TCursor;
};

export interface ExtractContext<TConfig = unknown, TCursor = unknown> {
  config: TConfig;
  cursor?: TCursor;
  upload: (params: {
    content: Buffer;
    name?: string;
    mimeType?: string;
  }) => Promise<UploadedFile>;
  download: (params: { id: string }) => Promise<Buffer>;
}

export type ExtractGeneratorFunction<TData, TConfig = {}, TCursor = {}> = (
  context: ExtractContext<TConfig, TCursor>,
) => AsyncGenerator<ExtractBatch<TData, TCursor>, void, void>;

export interface ExtractorCreateResult<TConfig> {
  key: string;
  config: TConfig;
}

export type CreateExtractorConfig<TConfig, TInput = TConfig> = {
  schema: z.ZodType<TInput>;
  create: (
    input: TInput,
  ) => ExtractorCreateResult<TConfig> | Promise<ExtractorCreateResult<TConfig>>;
};

export interface ExtractorConfig<TConfig, TInput = TConfig> {
  schema: z.ZodType<TInput>;
  create: (
    input: TInput,
  ) => ExtractorCreateResult<TConfig> | Promise<ExtractorCreateResult<TConfig>>;
}

/** Cursor definition: same shape as `config`’s `schema` field (no `create`). */
export type ExtractorCursorConfig<TCursor = unknown> = {
  schema: z.ZodType<TCursor>;
};

export interface Extractor<
  TData,
  TConfig = {},
  TCursor = {},
  TInput = TConfig,
> {
  id: string;
  cron: string;
  config: ExtractorConfig<TConfig, TInput>;
  cursor: ExtractorCursorConfig<TCursor> | undefined;
  extract: ExtractGeneratorFunction<TData, TConfig, TCursor>;
}

/** Widened extractor for generic constraints (e.g. `AnyPipeline`). */
export type AnyExtractor = Extractor<any, any, any, any>;

/** Datalake row shape (`TData`) carried by an extractor instance. */
export type ExtractorData<TExtractor> =
  TExtractor extends Extractor<infer TData, any, any, any> ? TData : never;

export interface CreateExtractorOptions<
  TData,
  TConfig = {},
  TCursor = {},
  TInput = TConfig,
> {
  id: string;
  cron: string;
  config: CreateExtractorConfig<TConfig, TInput>;
  cursor?: ExtractorCursorConfig<TCursor>;
  extract: ExtractGeneratorFunction<TData, TConfig, TCursor>;
}

type InferConfigFromCreate<TCreate extends (...args: never[]) => unknown> =
  Awaited<ReturnType<TCreate>> extends ExtractorCreateResult<infer TConfig>
    ? TConfig
    : never;

export function createExtractor<
  TData,
  TSchema extends z.ZodType,
  TCreate extends (
    input: z.infer<TSchema>,
  ) => ExtractorCreateResult<unknown> | Promise<ExtractorCreateResult<unknown>>,
  TCursorSchema extends z.ZodType,
>(options: {
  id: string;
  cron: string;
  config: {
    schema: TSchema;
    create: TCreate;
  };
  extract: ExtractGeneratorFunction<
    TData,
    InferConfigFromCreate<TCreate>,
    z.infer<TCursorSchema>
  >;
  cursor: {
    schema: TCursorSchema;
  };
}): Extractor<
  TData,
  InferConfigFromCreate<TCreate>,
  z.infer<TCursorSchema>,
  z.infer<TSchema>
>;

export function createExtractor<
  TData,
  TSchema extends z.ZodType,
  TCreate extends (
    input: z.infer<TSchema>,
  ) => ExtractorCreateResult<unknown> | Promise<ExtractorCreateResult<unknown>>,
>(options: {
  id: string;
  cron: string;
  config: {
    schema: TSchema;
    create: TCreate;
  };
  extract: ExtractGeneratorFunction<
    TData,
    InferConfigFromCreate<TCreate>,
    unknown
  >;
  cursor?: undefined;
}): Extractor<TData, InferConfigFromCreate<TCreate>, unknown, z.infer<TSchema>>;

export function createExtractor<TData>(options: {
  id: string;
  cron: string;
  config: {
    schema: z.ZodType;
    create: (input: unknown) => ExtractorCreateResult<unknown>;
  };
  extract: ExtractGeneratorFunction<TData, unknown, unknown>;
  cursor?: undefined;
}): Extractor<TData, unknown, unknown, unknown>;

export function createExtractor<
  TData,
  TConfig = unknown,
  TCursor = unknown,
  TInput = TConfig,
>(
  options: CreateExtractorOptions<TData, TConfig, TCursor, TInput>,
): Extractor<TData, TConfig, TCursor, TInput> {
  return {
    id: options.id,
    cron: options.cron,
    cursor: options.cursor,
    config: {
      schema: options.config.schema,
      create: options.config.create,
    },
    extract: options.extract,
  };
}
