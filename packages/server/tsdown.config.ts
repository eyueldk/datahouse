import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  dts: false,
  sourcemap: true,
  format: "esm",
  copy: [
    "migrations",
  ]
});
