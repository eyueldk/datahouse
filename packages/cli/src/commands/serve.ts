import { command, positional, option, number, string, optional } from "cmd-ts";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const serve = command({
  name: "serve",
  args: {
    path: positional({
      type: optional(string),
      displayName: "path",
    }),
    port: option({
      long: "port",
      short: "p",
      type: number,
      defaultValue: () => 2510,
    }),
  },
  handler: async (args) => {
    const path = require.resolve("@datahousejs/server");
    const child = Bun.spawn({
      cmd: ["bun", resolve(path)],
      env: {
        PORT: args.port.toString(),
        DATAHOUSE_PATH: args.path ?? join(process.cwd(), "index.js"),
        ...process.env,
      },
      stdout: "inherit",
      stderr: "inherit",
    });
    await child.exited;
  },
});
