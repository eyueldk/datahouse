import type { z } from "zod";
import type { UploadedFile } from "./file";
export type EmitExtractFn<TData, TCursor = unknown> = (items: Array<{
    key: string;
    data: TData;
}>, cursor?: TCursor) => Promise<void>;
export interface ExtractContext<TData, TConfig = unknown, TCursor = unknown> {
    config: TConfig;
    cursor?: TCursor;
    upload: (params: {
        content: File | Blob | ArrayBuffer;
        name?: string;
        mimeType?: string;
    }) => Promise<UploadedFile>;
    download: (params: {
        id: string;
    }) => Promise<ArrayBuffer>;
    emit: EmitExtractFn<TData, TCursor>;
}
export type ExtractFunction<TData, TConfig = unknown, TCursor = unknown> = (context: ExtractContext<TData, TConfig, TCursor>) => void | Promise<void>;
export interface ExtractorCreateResult<TConfig> {
    key: string;
    config: TConfig;
}
export type CreateExtractorConfig<TConfig, TInput = TConfig> = {
    schema: z.ZodType<TInput>;
    create: (input: TInput) => ExtractorCreateResult<TConfig> | Promise<ExtractorCreateResult<TConfig>>;
};
export interface ExtractorConfig<TConfig, TInput = TConfig> {
    schema: z.ZodType<TInput>;
    create: (input: TInput) => ExtractorCreateResult<TConfig> | Promise<ExtractorCreateResult<TConfig>>;
}
export interface Extractor<TData, TConfig = unknown, TCursor = unknown, TInput = TConfig> {
    id: string;
    cron: string;
    config: ExtractorConfig<TConfig, TInput>;
    extract: ExtractFunction<TData, TConfig, TCursor>;
}
export interface CreateExtractorOptions<TData, TConfig = unknown, TCursor = unknown, TInput = TConfig> {
    id: string;
    cron: string;
    config: CreateExtractorConfig<TConfig, TInput>;
    extract: ExtractFunction<TData, TConfig, TCursor>;
}
export declare function createExtractor<TData, TConfig = unknown, TCursor = unknown, TInput = TConfig>(options: CreateExtractorOptions<TData, TConfig, TCursor, TInput>): Extractor<TData, TConfig, TCursor, TInput>;
