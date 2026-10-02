import assert from "node:assert/strict";
import test from "node:test";
import { readSpeechDraft, writeSpeechDraft, type SpeechDraft } from "../src/features/text-to-speech/draft-store";

const example: SpeechDraft = { text: "आज मेरी meeting है।", language: "hinglish", voiceId: "hf_alpha", speed: 1.1, pronunciation: "आज मेरी meeting है।", backend: "wasm" };
function memoryStorage() {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
}

test("speech drafts preserve bilingual text and stay scoped to their workspace", () => {
  const storage = memoryStorage();
  assert.equal(writeSpeechDraft(storage, "workspace-a", example), true);
  assert.deepEqual(readSpeechDraft(storage, "workspace-a"), example);
  assert.equal(readSpeechDraft(storage, "workspace-b"), null);
});

test("corrupt or incompatible drafts do not restore invalid generation settings", () => {
  const storage = memoryStorage();
  writeSpeechDraft(storage, "workspace", { ...example, voiceId: "af_heart" });
  assert.equal(readSpeechDraft(storage, "workspace"), null);
  storage.setItem("resona-speech-draft-v1:workspace", "broken-json");
  assert.equal(readSpeechDraft(storage, "workspace"), null);
  writeSpeechDraft(storage, "workspace", { ...example, speed: Infinity });
  assert.equal(readSpeechDraft(storage, "workspace"), null);
});

test("blocked draft storage is nonfatal and old oversized scripts are bounded", () => {
  const blocked = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("full"); } };
  assert.equal(readSpeechDraft(blocked, "workspace"), null);
  assert.equal(writeSpeechDraft(blocked, "workspace", example), false);
  const storage = memoryStorage();
  writeSpeechDraft(storage, "workspace", { ...example, text: "a".repeat(6000) });
  assert.equal(readSpeechDraft(storage, "workspace")?.text.length, 5000);
});
