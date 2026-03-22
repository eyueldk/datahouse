import { pathToFileURL } from "node:url";
import { resolve, isAbsolute } from "node:path";
import type { DataHouse, AnyPipeline } from "@datahouse/core";

function toFileUrl(path: string): string {
  const absolute = isAbsolute(path) ? path : resolve(process.cwd(), path);
  return pathToFileURL(absolute).href;
}

export interface ConfigureOptions {
  /** Path to the config file. */
  configPath: string;
}

async function load(
  options: ConfigureOptions,
): Promise<DataHouse<AnyPipeline[]>> {
  const { configPath } = options;
  const url = toFileUrl(configPath);
  let mod: unknown;
  try {
    mod = await import(url);
  } catch (error) {
    throw new Error(
      `Failed to import DataHouse config from "${configPath}": ${String(error)}`,
    );
  }

  const maybeConfig = (mod as { default?: unknown }).default ?? mod;
  if (!maybeConfig || typeof maybeConfig !== "object") {
    throw new Error(
      `Config module "${configPath}" does not have a valid default export. Expected a DataHouse config.`,
    );
  }

  return maybeConfig as DataHouse<AnyPipeline[]>;
}

let config!: DataHouse<AnyPipeline[]>;

export async function configure(options: ConfigureOptions): Promise<void> {
  config = await load(options);
}

export { config };
