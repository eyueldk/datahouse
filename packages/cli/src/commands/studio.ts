import { command, option, number, string } from "cmd-ts";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL("..", import.meta.url));

export const studio = command({
  name: "studio",
  args: {
    port: option({
      long: "port",
      short: "p",
      type: number,
      defaultValue: () => 2511,
    }),
    apiUrl: option({
      long: "api-url",
      short: "u",
      type: string,
      defaultValue: () => "http://localhost:2510",
    }),
  },
  handler: async ({ port, apiUrl }) => {
    const path = require.resolve("@datahousejs/studio");
    const child = Bun.spawn({
      cmd: ["bun", resolve(path)],
      env: { PORT: port.toString(), DATAHOUSE_URL: apiUrl, ...process.env },
      stdout: "inherit",
      stderr: "inherit",
    });
    await child.exited;
  },
});
