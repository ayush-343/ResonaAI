import { z } from "zod";
import { ENGINE_VERSION, MODEL_ID, MODEL_REVISION, SAMPLE_RATE, TEXT_LIMIT, VOICES } from "../tts-engine/catalog";

export const speechMetadataSchema = z.object({
  id: z.string().uuid(), owner: z.string().min(1), text: z.string().trim().min(1).max(TEXT_LIMIT),
  spokenText: z.string().trim().min(1).max(TEXT_LIMIT), voiceId: z.enum(VOICES.map(voice => voice.id)),
  voiceName: z.string().min(1).max(80), language: z.enum(["en", "hi", "hinglish"]),
  speed: z.number().min(0.5).max(2), backend: z.enum(["webgpu", "wasm"]),
  modelId: z.literal(MODEL_ID), modelRevision: z.literal(MODEL_REVISION), engineVersion: z.literal(ENGINE_VERSION),
  duration: z.number().positive().max(1200), elapsedMs: z.number().nonnegative().max(86400000),
  firstAudioMs: z.number().nonnegative().max(86400000), createdAt: z.string().datetime(),
});
export const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

export function validateWav(bytes: Uint8Array) {
  if (bytes.byteLength < 46 || bytes.byteLength > MAX_AUDIO_BYTES) throw new Error("Audio must be a WAV file under 25 MB.");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const text = (offset: number, length: number) => String.fromCharCode(...bytes.slice(offset, offset + length));
  if (text(0, 4) !== "RIFF" || text(8, 4) !== "WAVE" || text(12, 4) !== "fmt " || text(36, 4) !== "data" ||
      view.getUint32(4, true) !== bytes.byteLength - 8 || view.getUint32(16, true) !== 16 ||
      view.getUint16(20, true) !== 1 || view.getUint16(22, true) !== 1 || view.getUint32(24, true) !== SAMPLE_RATE ||
      view.getUint32(28, true) !== SAMPLE_RATE * 2 || view.getUint16(32, true) !== 2 || view.getUint16(34, true) !== 16 || view.getUint32(40, true) !== bytes.byteLength - 44 || (bytes.byteLength - 44) % 2 !== 0) {
    throw new Error("Audio must be mono, 24 kHz, 16-bit PCM WAV from the speech engine.");
  }
  return { duration: (bytes.byteLength - 44) / 2 / SAMPLE_RATE, sampleRate: SAMPLE_RATE };
}
