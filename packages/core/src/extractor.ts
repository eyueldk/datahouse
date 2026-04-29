import { z } from "zod";
import type { UploadedFile } from "./file";

export type ExtractBatch<TData, TCursor = {}> = {
  items: Array<{
    key: string;
    data: TData;
    metadata?: Record<string, any>;
  }>;
  cursor?: TCursor;
};

/** Passed to `extract` — the stored source `config` (see extractor `config.create`). */
export interface ExtractContext<TConfig = {}, TCursor = {}> {
  config: TConfig;
  cursor?: TCursor;
  upload: (params: {
    content: Buffer;
    name?: string;
    mimeType?: string;
  }) => Promise<UploadedFile>;
  download: (params: { file: UploadedFile }) => Promise<Buffer>;
}

export type ExtractGeneratorFunction<
  TData,
  TConfig = {},
  TCursor = {},
> = (
  context: ExtractContext<TConfig, TCursor>,
) => AsyncGenerator<ExtractBatch<TData, TCursor>, void, void>;

export interface ExtractorCreateResult<TConfig> {
  key: string;
  config?: TConfig;
}

export type CreateExtractorConfig<TConfig, TInput = TConfig> = {
  schema?: z.ZodType<TInput>;
  create: (
    input: TInput,
  ) => ExtractorCreateResult<TConfig> | Promise<ExtractorCreateResult<TConfig>>;
};

export interface ExtractorConfig<TConfig, TInput = TConfig> {
  schema?: z.ZodType<TInput>;
  create: (
    input: TInput,
  ) => ExtractorCreateResult<TConfig> | Promise<ExtractorCreateResult<TConfig>>;
}

/** Cursor definition: same shape as `config`’s `schema` field (no `create`). */
export type ExtractorCursorConfig<TCursor = {}> = {
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

export function createExtractor<
  TData,
  TConfig = {},
  TCursor = {},
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
