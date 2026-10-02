/// <reference types="@webgpu/types" />
import { AutoTokenizer, StyleTextToSpeech2Model, Tensor, env } from "@huggingface/transformers";
import { MODEL_ID, MODEL_REVISION, SAMPLE_RATE, TEXT_LIMIT, getVoice, type Backend } from "./catalog";
import { encodeWav, joinAudio } from "./audio";
import { languageSpans, mapPhonemes, splitScript } from "./text";
import type { WorkerRequest, WorkerEvent } from "./protocol";

env.allowLocalModels = false;
env.useBrowserCache = true;
env.backends.onnx.wasm!.numThreads = 1;
env.backends.onnx.wasm!.wasmPaths = "/vendor/onnx/";
let model: Awaited<ReturnType<typeof StyleTextToSpeech2Model.from_pretrained>> | null = null;
let tokenizer: Awaited<ReturnType<typeof AutoTokenizer.from_pretrained>> | null = null;
let backend: Backend = "wasm";
let busy = false;
const voiceData = new Map<string, Float32Array>();
const send = (event: WorkerEvent, transfer: Transferable[] = []) => postMessage(event, { transfer });
type ESpeakModule = { FS: { readFile: (name: string, options: { encoding: string }) => string } };
type ESpeakFactory = (options: { arguments: string[]; wasmBinary: ArrayBuffer; printErr: (message: string) => void }) => Promise<ESpeakModule>;
let phonemizer: ESpeakFactory | null = null;
let phonemizerWasm: ArrayBuffer | null = null;

async function cachedAsset(url: string) {
  let cache: Cache | undefined;
  try { cache = await caches.open("resona-model-assets-v1"); const found = await cache.match(url); if (found) return found.arrayBuffer(); } catch { /* Storage may be unavailable; inference still works. */ }
  const response = await fetch(url);
  if (!response.ok) throw new Error("A model asset could not be downloaded. Check your connection and try again.");
  const bytes = await response.arrayBuffer();
  try { await cache?.put(url, new Response(bytes)); } catch { /* Cache quota does not invalidate the downloaded asset. */ }
  return bytes;
}

async function phonemize(text: string, language: "hi" | "en-us") {
  if (!phonemizer) {
    const url = new URL("/vendor/espeak/espeak-ng.js", self.location.origin).href;
    const imported = await import(/* webpackIgnore: true */ url) as { default: ESpeakFactory };
    phonemizerWasm = await cachedAsset(new URL("/vendor/espeak/espeak-ng.wasm", self.location.origin).href);
    phonemizer = imported.default;
  }
  const instance = await phonemizer({ arguments: ["--phonout", "phones", "-q", "--ipa=3", "-v", language, text], wasmBinary: phonemizerWasm!, printErr: () => {} });
  return mapPhonemes(instance.FS.readFile("phones", { encoding: "utf8" }), language === "hi");
}

async function voice(id: string) {
  const previous = voiceData.get(id); if (previous) return previous;
  const bytes = await cachedAsset(`https://huggingface.co/${MODEL_ID}/resolve/${MODEL_REVISION}/voices/${id}.bin`);
  const data = new Float32Array(bytes);
  if (data.length !== 510 * 256 || data.some(value => !Number.isFinite(value))) throw new Error("The voice download is invalid. Clear the model cache and retry.");
  voiceData.set(id, data); return data;
}

async function run(request: WorkerRequest) {
  if (request.type === "load") {
    const start = performance.now();
    if (model && backend === request.backend) { send({ id: request.id, type: "ready", backend, loadMs: 0 }); return; }
    if (request.backend === "webgpu") {
      const adapter = await navigator.gpu?.requestAdapter();
      if (!adapter) throw new Error("WebGPU is unavailable on this laptop. Select CPU and load the smaller model.");
    }
    await model?.dispose(); model = null;
    backend = request.backend;
    send({ id: request.id, type: "progress", message: "Downloading model files…" });
    model = await StyleTextToSpeech2Model.from_pretrained(MODEL_ID, {
      revision: MODEL_REVISION, device: backend, dtype: backend === "webgpu" ? "fp32" : "q8",
      progress_callback: progress => {
        if (progress.status === "progress") send({ id: request.id, type: "progress", message: `Downloading ${progress.file}`, progress: progress.progress });
        if (progress.status === "done") send({ id: request.id, type: "progress", message: "Preparing the speech engine…" });
      },
    });
    tokenizer = await AutoTokenizer.from_pretrained(MODEL_ID, { revision: MODEL_REVISION });
    // Initialize pronunciation too: no hidden first-generation language download.
    await phonemize("hello", "en-us");
    send({ id: request.id, type: "ready", backend, loadMs: performance.now() - start });
    return;
  }
  if (!model || !tokenizer) throw new Error("Load the speech model before generating.");
  const { input } = request;
  if (!input.text.trim() || input.text.length > TEXT_LIMIT || !Number.isFinite(input.speed) || input.speed < 0.5 || input.speed > 2) throw new Error("Enter a script up to 5,000 characters and choose a supported speed.");
  if (!getVoice(input.voiceId)) throw new Error("Choose a supported voice.");
  const start = performance.now();
  const scripts = splitScript(input.text);
  const chunks: Float32Array[] = [];
  const data = await voice(input.voiceId);
  let firstAudioMs = 0;
  for (let index = 0; index < scripts.length; index++) {
    const parts: string[] = [];
    for (const span of languageSpans(scripts[index], input.language)) {
      if (span.text.trim()) parts.push(await phonemize(span.text, span.language));
    }
    const phones = parts.join(" ");
    // Split phonemes as well: never rely on tokenizer truncation for long words.
    for (const phoneChunk of splitScript(phones, 380)) {
      const { input_ids } = tokenizer(phoneChunk, { truncation: false });
      const count = input_ids.dims.at(-1)!;
      if (count > 510) throw new Error("A pronunciation segment is too long. Add punctuation and retry.");
      const style = data.slice(Math.max(0, count - 2) * 256, Math.max(0, count - 2) * 256 + 256);
      const output = await model({ input_ids, style: new Tensor("float32", style, [1, 256]), speed: new Tensor("float32", [input.speed], [1]) });
      chunks.push(new Float32Array(output.waveform.data));
      if (!firstAudioMs) firstAudioMs = performance.now() - start;
    }
    send({ id: request.id, type: "chunk", done: index + 1, total: scripts.length, firstAudioMs });
  }
  const samples = joinAudio(chunks, SAMPLE_RATE);
  if (!samples.length || samples.some(value => !Number.isFinite(value))) throw new Error("The engine did not return valid audio. Try a shorter script or use CPU mode.");
  const wav = encodeWav(samples, SAMPLE_RATE);
  send({ id: request.id, type: "result", wav, duration: samples.length / SAMPLE_RATE, elapsedMs: performance.now() - start, firstAudioMs, backend }, [wav]);
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;
  if (busy) { send({ id: request.id, type: "error", message: "The speech engine is already working." }); return; }
  busy = true;
  try { await run(request); }
  catch (error) { send({ id: request.id, type: "error", message: error instanceof Error ? error.message : "Speech generation failed. Reload the model and try again." }); }
  finally { busy = false; }
};
