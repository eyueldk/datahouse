import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/core.ts",
    "src/client.ts",
    "src/cli.ts",
  ],
  format: "esm",
  outDir: "dist",
  dts: true,
  clean: true,
  sourcemap: true,
  platform: "node",
  copy: [
    { from: "node_modules/@datahouse/runtime/migrations", to: "dist" },
    { from: "node_modules/@datahouse/studio/dist", to: "dist", rename: "studio" },
    { from: "node_modules/@electric-sql/pglite/dist/pglite.data", to: "dist" },
    { from: "node_modules/@electric-sql/pglite/dist/pglite.wasm", to: "dist" },
    { from: "node_modules/@electric-sql/pglite/dist/initdb.wasm", to: "dist" },
  ],
});
