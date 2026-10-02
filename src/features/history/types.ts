import type { Backend, LanguageMode, VoiceId } from "../tts-engine/catalog";
export type SpeechRecord = {
  id: string; owner: string; text: string; spokenText: string; voiceId: VoiceId; voiceName: string;
  language: LanguageMode; speed: number; backend: Backend; modelId: string; modelRevision: string;
  engineVersion: string; duration: number; elapsedMs: number; firstAudioMs: number;
  createdAt: string; blob: Blob; saved: boolean;
};
export type CloudRecord = Omit<SpeechRecord, "owner" | "blob" | "saved" | "spokenText" | "voiceId" | "speed"> & { audioUrl: string };
