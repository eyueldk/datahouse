import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { command, number, optional, option, positional, string } from "cmd-ts";
import { startServer } from "@datahouse/runtime";

const DEFAULT_CONFIG_FILES = [
  "index.js",
  "index.ts",
  "src/index.js",
  "src/index.ts",
];

function getDefaultConfigPath(): string {
  for (const file of DEFAULT_CONFIG_FILES) {
    if (existsSync(resolve(process.cwd(), file))) {
      return file;
    }
  }

  throw new Error(
    `No config file found. Please provide a config file path or create one of: ${DEFAULT_CONFIG_FILES.join(", ")}`,
  );
}

export const serveCommand = command({
  name: "serve",
  description: "Start the Datahouse server",
  args: {
    file: positional({
      type: optional(string),
      displayName: "file",
      description: `Config file path (default: first of ${DEFAULT_CONFIG_FILES.join(", ")})`,
    }),
    port: option({
      type: number,
      long: "port",
      short: "p",
      defaultValue: () => 2510,
    }),
  },
  handler: async (args) => {
    const configPath = args.file ?? getDefaultConfigPath();
    await startServer({ configPath, port: args.port });
  },
});
