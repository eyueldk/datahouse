import type { DataHouse, AnyPipeline } from "@datahouse/core";
export interface ConfigureOptions {
    /** Path to the config file. */
    configPath: string;
}
declare let config: DataHouse<AnyPipeline[]>;
export declare function configure(options: ConfigureOptions): Promise<void>;
export { config };
