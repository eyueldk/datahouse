import { z } from "zod";
import { resolve } from "node:path";
import type { Datahouse, AnyPipeline } from "@datahousejs/core";
import { pathToFileURL } from "node:url";

const schema = z.object({
  PORT: z.coerce.number().int().positive().optional().default(2510),
  DATAHOUSE_PATH: z.string().min(1).optional().default("index.js"),
});

const env = schema.parse(process.env);

async function importModule(path: string): Promise<{ default?: unknown}> {
  const url = pathToFileURL(resolve(path)).href;
  try {
    return await import(url);
  } catch (error) {
    throw new Error(
      `Failed to import Datahouse module from "${path}".\nError: ${error}`,
    );
  }
}

async function importDatahouse(options: {
  path: string
}): Promise<Datahouse<AnyPipeline[]>> {
  const { path } = options;
  let mod = await importModule(path);
  const datahouse = mod.default;
  if (!datahouse || typeof datahouse !== "object") {
    throw new Error(
      `Datahouse module "${path}" does not have a valid default export. Expected a Datahouse config.`,
    );
  }
  return datahouse as Datahouse<AnyPipeline[]>;
}

export const PORT = env.PORT;

export const datahouse = await importDatahouse({
  path: env.DATAHOUSE_PATH
});