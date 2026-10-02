import { MODEL_ID } from "@/features/tts-engine/catalog";

export function isSpeechAsset(address: string, origin: string): boolean {
  try {
    const url = new URL(address);
    const path = decodeURIComponent(url.pathname);
    return (url.hostname === "huggingface.co" && path.startsWith(`/${MODEL_ID}/resolve/`)) ||
      (url.origin === origin && path === "/vendor/espeak/espeak-ng.wasm");
  } catch { return false; }
}

export async function inspectSpeechCache() {
  let assets = 0;
  const models = new Set<string>();
  for (const name of await caches.keys()) {
    if (name !== "resona-model-assets-v1" && name !== "transformers-cache") continue;
    const cache = await caches.open(name);
    for (const request of await cache.keys()) {
      if (!isSpeechAsset(request.url, window.location.origin)) continue;
      assets++;
      if (new URL(request.url).pathname.endsWith("/model.onnx")) models.add("GPU");
      if (new URL(request.url).pathname.endsWith("/model_quantized.onnx")) models.add("CPU");
    }
  }
  return { assets, models: [...models] };
}

export async function removeSpeechCache() {
  for (const name of await caches.keys()) {
    if (name !== "resona-model-assets-v1" && name !== "transformers-cache") continue;
    const cache = await caches.open(name);
    for (const request of await cache.keys()) {
      if (isSpeechAsset(request.url, window.location.origin)) await cache.delete(request);
    }
  }
}
