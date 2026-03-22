import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/core.ts", "src/client.ts", "src/cli.ts"],
  format: "esm",
  outDir: "dist",
  dts: true,
  clean: true,
  platform: "node",
  deps: {
    neverBundle: ["@datahouse/core", "@datahouse/client", "@datahouse/runtime", "cmd-ts"],
  },
  copy: [
    { from: "node_modules/@datahouse/runtime/migrations", to: "dist" },
    { from: "../studio/dist", to: "dist", rename: "studio" },
  ],
});
