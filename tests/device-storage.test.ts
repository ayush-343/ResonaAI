import assert from "node:assert/strict";
import test from "node:test";
import { isSpeechAsset } from "../src/features/settings/device-storage";
import { MODEL_ID } from "../src/features/tts-engine/catalog";
test("model cache removal is restricted to speech assets and same-origin pronunciation files", () => {
  const origin = "https://resona.example";
  assert.ok(isSpeechAsset(`https://huggingface.co/${MODEL_ID}/resolve/pinned/onnx/model.onnx`, origin));
  assert.ok(isSpeechAsset(`${origin}/vendor/espeak/espeak-ng.wasm`, origin));
  assert.ok(!isSpeechAsset("https://huggingface.co/other/model/resolve/main/model.onnx", origin));
  assert.ok(!isSpeechAsset(`https://other.example/${MODEL_ID}/resolve/pinned/onnx/model.onnx`, origin));
  assert.ok(!isSpeechAsset("https://other.example/vendor/espeak/espeak-ng.wasm", origin));
  assert.ok(!isSpeechAsset(`${origin}/api/generations/audio.wav`, origin));
  assert.ok(!isSpeechAsset("invalid", origin));
});
