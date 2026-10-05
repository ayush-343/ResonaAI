import { encodeWav } from "../tts-engine/audio";
import { ENGINE_VERSION, MODEL_ID, MODEL_REVISION, SAMPLE_RATE, getVoice } from "../tts-engine/catalog";
import { MAX_AUDIO_BYTES, speechMetadataSchema } from "../history/validation";
import type { SpeechRecord } from "../history/types";
import { fingerprint, speechChunks, type ProjectBlock } from "./model";
import type { AudioReader } from "./generation";
// Blob slices reference stored PCM without allocating a full-project Float32Array.
export async function exportWav(blocks: ProjectBlock[], read: AudioReader): Promise<Blob> {
  const parts: BlobPart[] = [];
  let bytes = 0;
  if (!blocks.length) throw new Error("Add script blocks before exporting.");
  for (const block of blocks) {
    const chunks = speechChunks(block);
    if (!chunks.length) throw new Error("Remove empty blocks or add their script before exporting.");
    for (let i = 0; i < chunks.length; i++) {
      const audio = await read(block.id, i);
      if (!audio || audio.fingerprint !== fingerprint(block)) throw new Error("Generate every missing or changed section before exporting.");
      parts.push(audio.blob.slice(44)); bytes += audio.blob.size - 44;
    }
    const silence = new Uint8Array(Math.round(block.pause * SAMPLE_RATE) * 2);
    parts.push(silence); bytes += silence.byteLength;
    if (bytes > 0xffffffff - 36) throw new Error("This project exceeds WAV's size limit. Export individual chapters.");
  }
  const header = encodeWav(new Float32Array(0), SAMPLE_RATE), view = new DataView(header);
  view.setUint32(4, bytes + 36, true); view.setUint32(40, bytes, true);
  return new Blob([header, ...parts], { type: "audio/wav" });
}
export async function cloudExportRecord(blocks: ProjectBlock[], read: AudioReader, blob: Blob, orgId: string): Promise<SpeechRecord> {
  const first = blocks[0];
  if (!first || blocks.some(block => block.voiceId !== first.voiceId || block.language !== first.language || block.speed !== first.speed)) throw new Error("Workspace history supports one voice, language, and speed per recording. Download this multi-speaker export instead.");
  const text = blocks.map(block => block.text).join("\n\n"), spokenText = blocks.map(block => block.pronunciation || block.text).join("\n\n");
  let elapsedMs = 0, firstAudioMs = 0;
  let backend: "webgpu" | "wasm" | undefined;
  for (const block of blocks) for (let i = 0; i < speechChunks(block).length; i++) {
    const audio = await read(block.id, i);
    if (!audio || audio.fingerprint !== fingerprint(block)) throw new Error("Generate changed sections before saving.");
    if (backend && backend !== audio.backend) throw new Error("This export mixes GPU and CPU results. Download it instead of saving to workspace history.");
    backend = audio.backend; elapsedMs += audio.elapsedMs; firstAudioMs ||= audio.firstAudioMs;
  }
  const record: SpeechRecord = { id: crypto.randomUUID(), owner: orgId, text, spokenText, voiceId: first.voiceId, voiceName: getVoice(first.voiceId)!.name, language: first.language, speed: first.speed, backend: backend ?? "wasm", modelId: MODEL_ID, modelRevision: MODEL_REVISION, engineVersion: ENGINE_VERSION, duration: (blob.size - 44) / (SAMPLE_RATE * 2), elapsedMs, firstAudioMs, createdAt: new Date().toISOString(), blob, saved: false };
  if (blob.size > MAX_AUDIO_BYTES || !speechMetadataSchema.safeParse(record).success) throw new Error("Workspace history accepts exports up to 5,000 characters, 20 minutes, and 25 MB. Download this export instead.");
  return record;
}
