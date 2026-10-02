import { getVoice, TEXT_LIMIT, type Backend, type LanguageMode, type VoiceId } from "@/features/tts-engine/catalog";

export type SpeechDraft = {
  text: string;
  language: LanguageMode;
  voiceId: VoiceId;
  speed: number;
  pronunciation: string;
  backend: Backend;
};

type DraftStorage = Pick<Storage, "getItem" | "setItem">;
const keyFor = (owner: string) => `resona-speech-draft-v1:${encodeURIComponent(owner)}`;

export function readSpeechDraft(storage: DraftStorage, owner: string): SpeechDraft | null {
  try {
    const raw = storage.getItem(keyFor(owner));
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    const draft = value as Record<string, unknown>;
    const voice = typeof draft.voiceId === "string" ? getVoice(draft.voiceId) : undefined;
    if (!voice || !["en", "hi", "hinglish"].includes(String(draft.language))) return null;
    const language = draft.language as LanguageMode;
    if (voice.language !== (language === "en" ? "en" : "hi")) return null;
    if (typeof draft.text !== "string" || typeof draft.pronunciation !== "string") return null;
    if (typeof draft.speed !== "number" || !Number.isFinite(draft.speed) || draft.speed < 0.5 || draft.speed > 2) return null;
    if (draft.backend !== "webgpu" && draft.backend !== "wasm") return null;
    return {
      text: draft.text.slice(0, TEXT_LIMIT), pronunciation: draft.pronunciation.slice(0, TEXT_LIMIT),
      language, voiceId: voice.id, speed: draft.speed, backend: draft.backend,
    };
  } catch {
    return null;
  }
}

export function writeSpeechDraft(storage: DraftStorage, owner: string, draft: SpeechDraft): boolean {
  try {
    storage.setItem(keyFor(owner), JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}
