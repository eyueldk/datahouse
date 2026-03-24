import type { z } from "zod";
import type { UploadedFile } from "./file";

export type EmitExtractFn<TData, TCursor = unknown> = (params: {
  items: Array<{ key: string; data: TData }>;
  cursor?: TCursor;
}) => Promise<void>;

export interface ExtractContext<TData, TConfig = unknown, TCursor = unknown> {
  config: TConfig;
  cursor?: TCursor;
  upload: (params: {
    content: File | Blob | Buffer;
    name?: string;
    mimeType?: string;
  }) => Promise<UploadedFile>;
  download: (params: { id: string }) => Promise<Buffer>;
  emit: EmitExtractFn<TData, TCursor>;
}

export type ExtractFunction<TData, TConfig = unknown, TCursor = unknown> = (
  context: ExtractContext<TData, TConfig, TCursor>,
) => void | Promise<void>;

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
  TConfig = unknown,
  TCursor = unknown,
  TInput = TConfig,
> {
  id: string;
  cron: string;
  config: ExtractorConfig<TConfig, TInput>;
  /** Always present; `undefined` when this extractor does not use a cursor. */
  cursor: ExtractorCursorConfig<TCursor> | undefined;
  extract: ExtractFunction<TData, TConfig, TCursor>;
}

export interface CreateExtractorOptions<
  TData,
  TConfig = unknown,
  TCursor = unknown,
  TInput = TConfig,
> {
  id: string;
  cron: string;
  config: CreateExtractorConfig<TConfig, TInput>;
  cursor?: ExtractorCursorConfig<TCursor>;
  extract: ExtractFunction<TData, TConfig, TCursor>;
}

export function createExtractor<
  TData,
  TConfig = unknown,
  TInput = TConfig,
  TCursor = unknown,
>(
  options: CreateExtractorOptions<TData, TConfig, TCursor, TInput> & {
    cursor: ExtractorCursorConfig<TCursor>;
  },
): Extractor<TData, TConfig, TCursor, TInput>;

export function createExtractor<
  TData,
  TConfig = unknown,
  TInput = TConfig,
>(
  options: CreateExtractorOptions<TData, TConfig, unknown, TInput> & {
    cursor?: undefined;
  },
): Extractor<TData, TConfig, unknown, TInput>;

export function createExtractor<
  TData,
  TConfig = unknown,
  TInput = TConfig,
  TCursor = unknown,
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
