#!/usr/bin/env node

import { build } from "esbuild";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeAssetIndex } from "./scripts/assets.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));
const paperclipSdkRoot = [
  process.env.PAPERCLIP_SDK_DIST,
  path.resolve(root, "../../packages/plugins/sdk/dist"),
  "/home/garratt/dev/4_repos/paperclip/packages/plugins/sdk/dist",
].find((candidate) => candidate && existsSync(path.join(candidate, "index.js")));

if (!paperclipSdkRoot) {
  throw new Error(
    "Could not find @paperclipai/plugin-sdk dist. Set PAPERCLIP_SDK_DIST=/path/to/paperclip/packages/plugins/sdk/dist",
  );
}

const paperclipSdkAlias = {
  name: "paperclip-sdk-alias",
  setup(build) {
    build.onResolve({ filter: /^@paperclipai\/plugin-sdk$/ }, () => ({
      path: path.join(paperclipSdkRoot, "index.js"),
    }));
  },
};

await mkdir(path.join(root, "dist/ui"), { recursive: true });

await build({
  entryPoints: [path.join(root, "src/worker.ts")],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  outfile: path.join(root, "dist/worker.js"),
  external: ["node:*"],
  plugins: [paperclipSdkAlias],
  sourcemap: true,
});

await build({
  entryPoints: [path.join(root, "src/ui/index.tsx")],
  bundle: true,
  platform: "browser",
  target: "es2020",
  format: "esm",
  outfile: path.join(root, "dist/ui/index.js"),
  jsx: "automatic",
  external: ["react", "react/jsx-runtime", "@paperclipai/plugin-sdk/ui", "@paperclipai/plugin-sdk"],
  sourcemap: true,
});

await build({
  entryPoints: [path.join(root, "src/manifest.ts")],
  bundle: false,
  platform: "node",
  target: "node20",
  format: "esm",
  outfile: path.join(root, "dist/manifest.js"),
});

await writeAssetIndex(root, path.join(root, "dist/ui/assets"));

console.log("Agent Pixels plugin built");
