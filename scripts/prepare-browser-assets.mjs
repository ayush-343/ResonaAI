import { mkdir, copyFile, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const targets = [
  [resolve("node_modules/pdfjs-dist/legacy/build"), "public/vendor/pdfjs", ["pdf.worker.min.mjs"]],
  [dirname(require.resolve("espeak-ng")), "public/vendor/espeak", ["espeak-ng.js", "espeak-ng.wasm"]],
  [resolve("node_modules/onnxruntime-web/dist"), "public/vendor/onnx", null],
];
for (const [source, destination, names] of targets) {
  await mkdir(destination, { recursive: true });
  for (const name of names ?? (await readdir(source)).filter(name => /^ort-wasm.*\.(wasm|mjs)$/.test(name))) {
    await copyFile(resolve(source, name), resolve(destination, name));
  }
}
await copyFile("node_modules/espeak-ng/LICENSE", "public/vendor/espeak/LICENSE");
await copyFile("node_modules/pdfjs-dist/LICENSE", "public/vendor/pdfjs/LICENSE");
console.log("Browser pronunciation, ONNX runtime and PDF worker assets prepared.");
