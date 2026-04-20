import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  outDir: "dist",
  platform: "node",
  external: ["@buildbridge/stellar"],
});