import type { LanguageMode } from "./catalog";

export function normalizeScript(text: string) {
  return text.normalize("NFC").replace(/\r\n?/g, "\n").replace(/[\u200b\ufeff]/g, "").trim();
}

// Preserve every non-whitespace character; the tokenizer applies its own limit later.
export function splitScript(text: string, limit = 240): string[] {
  if (limit < 1) throw new Error("Chunk size must be positive.");
  const words = text.match(/\S+\s*/gu) ?? [];
  const chunks: string[] = [];
  let current = "";
  for (const word of words) {
    if (current && current.length + word.length > limit) {
      chunks.push(current.trim()); current = "";
    }
    if (word.length > limit) {
      const characters = Array.from(word);
      while (characters.length > limit) chunks.push(characters.splice(0, limit).join(""));
      current = characters.join("");
    } else {
      current += word;
      if (/[.!?।]\s*$/u.test(word)) { chunks.push(current.trim()); current = ""; }
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

export function languageSpans(text: string, mode: LanguageMode): { text: string; language: "hi" | "en-us" }[] {
  if (mode !== "hinglish") return [{ text, language: mode === "hi" ? "hi" : "en-us" }];
  // Mixed-script mode preserves one selected speaker while routing pronunciation.
  // Romanized Hindi is ambiguous: users supply Devanagari in the pronunciation override.
  const spans = text.match(/[\u0900-\u097f]+(?:[\s\d.,!?।]*[\u0900-\u097f]+)*|[^\u0900-\u097f]+/gu) ?? [];
  return spans.map(text => ({ text, language: /[\u0900-\u097f]/u.test(text) ? "hi" : "en-us" }));
}

export function mapPhonemes(ipa: string, hindi: boolean) {
  let result = ipa.replace(/\([a-z-]+\)/gi, "").replace(/\u200d/g, "");
  if (hindi) {
    for (const [from, to] of [["aɪ", "I"], ["aʊ", "W"], ["dʒ", "ʤ"], ["dz", "ʣ"], ["eɪ", "A"], ["oʊ", "O"], ["əʊ", "Q"], ["tʃ", "ʧ"], ["ts", "ʦ"], ["ɔɪ", "Y"]]) result = result.replaceAll(from, to);
    result = result.replace(/[\u0361\u035c^-]/g, "");
  } else {
    result = result.replace(/ʲ/g, "j").replace(/r/g, "ɹ").replace(/x/g, "k").replace(/ɬ/g, "l");
  }
  return result.replace(/\s+/g, " ").trim();
}
