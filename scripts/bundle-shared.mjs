import * as esbuild from "esbuild";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

await esbuild.build({
  entryPoints: [join(root, "packages/shared/src/index.ts")],
  outfile: join(root, "packages/shared/dist/index.js"),
  bundle: true,
  platform: "neutral",
  format: "esm",
  target: "es2022",
  logLevel: "info",
  packages: "bundle",
});

console.log("Bundled packages/shared/dist/index.js");
