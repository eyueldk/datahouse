import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/cli.ts", "src/core.ts", "src/client.ts"],
  outDir: "dist",
  dts: true,
  sourcemap: true,
});
