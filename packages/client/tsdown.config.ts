import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: "esm",
  target: "node18",
  dts: true,
  exports: true,
  sourcemap: true,
});