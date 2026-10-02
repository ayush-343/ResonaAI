import type { Backend, LanguageMode, VoiceId } from "./catalog";
export type GenerateInput = { text: string; language: LanguageMode; voiceId: VoiceId; speed: number };
export type WorkerRequest = { id: string; type: "load"; backend: Backend } | { id: string; type: "generate"; input: GenerateInput };
export type WorkerEvent =
  | { id: string; type: "progress"; message: string; progress?: number }
  | { id: string; type: "ready"; backend: Backend; loadMs: number }
  | { id: string; type: "chunk"; done: number; total: number; firstAudioMs: number }
  | { id: string; type: "result"; wav: ArrayBuffer; duration: number; elapsedMs: number; firstAudioMs: number; backend: Backend }
  | { id: string; type: "error"; message: string };
