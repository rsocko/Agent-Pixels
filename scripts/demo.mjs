#!/usr/bin/env node

import { build, context } from "esbuild";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeAssetIndex } from "./assets.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outputDir = path.join(root, "demo-dist");
const serve = process.argv.includes("--serve");
const portArg = process.argv.find((argument) => argument.startsWith("--port="));
const port = Number(portArg?.split("=")[1] ?? 4173);

await mkdir(outputDir, { recursive: true });
await writeFile(
  path.join(outputDir, "index.html"),
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#090d14" />
    <title>Agent Pixels — Standalone Camera</title>
    <link rel="icon" href="./assets/brand/agent-pixels-favicon-source.png" />
    <link rel="stylesheet" href="./app.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./app.js"></script>
  </body>
</html>
`,
);
await writeAssetIndex(root, path.join(outputDir, "assets"));

const options = {
  entryPoints: [path.join(root, "src/demo/index.tsx")],
  bundle: true,
  platform: "browser",
  target: "es2020",
  format: "esm",
  outfile: path.join(outputDir, "app.js"),
  jsx: "automatic",
  sourcemap: true,
};

if (serve) {
  const buildContext = await context(options);
  const server = await buildContext.serve({
    servedir: outputDir,
    host: "127.0.0.1",
    port,
  });
  console.log(`Agent Pixels demo running at http://127.0.0.1:${server.port}`);
} else {
  await build(options);
  console.log("Agent Pixels standalone demo built");
}
