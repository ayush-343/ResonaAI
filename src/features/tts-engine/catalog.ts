export const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
export const MODEL_REVISION = "1939ad2a8e416c0acfeecc08a694d14ef25f2231";
export const ENGINE_VERSION = "resona-kokoro-1";
export const SAMPLE_RATE = 24000;
export const TEXT_LIMIT = 5000;
export type LanguageMode = "en" | "hi" | "hinglish";
export type Backend = "webgpu" | "wasm";
export const VOICES = [
  { id: "af_heart", name: "Heart", language: "en", accent: "American English", description: "A clear, warm voice for everyday listening." },
  { id: "af_bella", name: "Bella", language: "en", accent: "American English", description: "A softer voice for narration." },
  { id: "am_michael", name: "Michael", language: "en", accent: "American English", description: "A measured voice for longer scripts." },
  { id: "bf_emma", name: "Emma", language: "en", accent: "British English", description: "A British voice for reading and voiceovers." },
  { id: "hf_alpha", name: "Alpha", language: "hi", accent: "Hindi · experimental", description: "Hindi and mixed-script speech. Evaluate pronunciation before publishing." },
  { id: "hf_beta", name: "Beta", language: "hi", accent: "Hindi · experimental", description: "An alternative Hindi voice for comparison." },
  { id: "hm_omega", name: "Omega", language: "hi", accent: "Hindi · experimental", description: "Hindi speech for scripts and listening." },
  { id: "hm_psi", name: "Psi", language: "hi", accent: "Hindi · experimental", description: "An alternative Hindi voice for comparison." },
] as const;
export type VoiceId = typeof VOICES[number]["id"];
export const getVoice = (id: string) => VOICES.find(voice => voice.id === id);
export const voicesFor = (language: LanguageMode) => VOICES.filter(voice => voice.language === (language === "en" ? "en" : "hi"));
export const SAMPLES: Record<LanguageMode, string> = {
  en: "A good story gives us a different way to see the world. Take a breath, settle in, and let's begin.",
  hi: "नमस्ते। आज हम एक नई कहानी सुनेंगे। दिल्ली से मुंबई तक का सफ़र तीन घंटे का है।",
  hinglish: "कल मेरी meeting तीन बजे है। Please send the report before lunch. फिर हम साथ में coffee पिएंगे।",
};
