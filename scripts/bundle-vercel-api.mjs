import * as esbuild from "esbuild";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

await esbuild.build({
  entryPoints: [join(root, "api/app-entry.ts")],
  outfile: join(root, "api/_app.bundle.mjs"),
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  logLevel: "info",
  // Bundle local workspace sources + deps so Vercel does not resolve raw .ts
  packages: "bundle",
});

console.log("Bundled api/_app.bundle.mjs");
