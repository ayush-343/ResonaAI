import { ENGINE_VERSION, MODEL_ID, MODEL_REVISION, TEXT_LIMIT, voicesFor, type LanguageMode, type VoiceId } from "../tts-engine/catalog";
import { normalizeScript } from "../tts-engine/text";

export const PROJECT_TEXT_LIMIT = 100_000;
export const IMPORT_BYTE_LIMIT = 20 * 1024 * 1024;
export type Speaker = { id: string; name: string; voiceId: VoiceId };
export type ProjectBlock = { id: string; text: string; speakerId: string; voiceId: VoiceId; language: LanguageMode; speed: number; pronunciation: string; pause: number };
export type Chapter = { id: string; title: string; blocks: ProjectBlock[] };
export type PlaybackPosition = { blockId: string; chunk: number; seconds: number };
export type Bookmark = PlaybackPosition & { id: string; label: string };
export type Project = { id: string; owner: string; title: string; chapters: Chapter[]; speakers: Speaker[]; bookmarks: Bookmark[]; position: PlaybackPosition | null; createdAt: string; updatedAt: string; revision: number };
export type AudioRevision = { key: string; projectKey: string; blockId: string; chunk: number; fingerprint: string; blob: Blob; duration: number; backend: "webgpu" | "wasm"; elapsedMs: number; firstAudioMs: number };
export const ownerKey = (userId: string, orgId: string) => JSON.stringify([userId, orgId]);
export const projectKey = (owner: string, id: string) => JSON.stringify([owner, id]);
export const audioKey = (owner: string, projectId: string, blockId: string, chunk: number) => JSON.stringify([owner, projectId, blockId, chunk]);
export function newBlock(speaker: Speaker, text = ""): ProjectBlock {
  return { id: crypto.randomUUID(), text, speakerId: speaker.id, voiceId: speaker.voiceId, language: speaker.voiceId.startsWith("h") ? "hi" : "en", speed: 1, pronunciation: "", pause: 0.3 };
}
export function newProject(owner: string, title = "Untitled project"): Project {
  const speaker: Speaker = { id: crypto.randomUUID(), name: "Narrator", voiceId: "af_heart" };
  return { id: crypto.randomUUID(), owner, title, speakers: [speaker], chapters: [{ id: crypto.randomUUID(), title: "Chapter 1", blocks: [newBlock(speaker)] }], bookmarks: [], position: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), revision: 0 };
}
export const allBlocks = (project: Project) => project.chapters.flatMap(chapter => chapter.blocks);
export const textCount = (project: Project) => allBlocks(project).reduce((total, block) => total + block.text.length + block.pronunciation.length, 0);
export function fingerprint(block: ProjectBlock) {
  return JSON.stringify([block.text, block.pronunciation, block.voiceId, block.language, block.speed, ENGINE_VERSION, MODEL_ID, MODEL_REVISION]);
}
// Slice by UTF-16 units to satisfy the worker limit without separating surrogate pairs.
export function speechChunks(block: ProjectBlock): string[] {
  let remaining = normalizeScript(block.pronunciation || block.text);
  const chunks: string[] = [];
  while (remaining.length > TEXT_LIMIT) {
    let end = remaining.lastIndexOf(" ", TEXT_LIMIT);
    if (end < TEXT_LIMIT / 2) end = TEXT_LIMIT;
    if (/[\uD800-\uDBFF]/.test(remaining[end - 1])) end--;
    chunks.push(remaining.slice(0, end)); remaining = remaining.slice(end).trimStart();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}
export function assignSpeaker(block: ProjectBlock, speaker: Speaker): ProjectBlock {
  const language = speaker.voiceId.startsWith("h") ? (block.language === "hinglish" ? "hinglish" : "hi") : "en";
  return { ...block, speakerId: speaker.id, voiceId: speaker.voiceId, language };
}
export function changeLanguage(block: ProjectBlock, language: LanguageMode): ProjectBlock {
  return { ...block, language, voiceId: voicesFor(language)[0].id };
}
export function splitBlock(block: ProjectBlock, offset: number): [ProjectBlock, ProjectBlock] {
  if (offset <= 0 || offset >= block.text.length) throw new Error("Place the cursor inside the script to split it.");
  if (block.pronunciation.trim()) throw new Error("Clear the pronunciation override before splitting, then add overrides to each section.");
  return [{ ...block, text: block.text.slice(0, offset), pause: 0.3 }, { ...block, id: crypto.randomUUID(), text: block.text.slice(offset) }];
}
export function moveItem<T>(items: T[], index: number, delta: number): T[] {
  const next = [...items], target = index + delta;
  if (target < 0 || target >= next.length) return next;
  [next[index], next[target]] = [next[target], next[index]]; return next;
}
export function cloneProject(source: Project): Project {
  return { ...source, id: crypto.randomUUID(), title: `${source.title} (copy)`, chapters: source.chapters.map(chapter => ({ ...chapter, id: crypto.randomUUID(), blocks: chapter.blocks.map(block => ({ ...block, id: crypto.randomUUID() })) })), bookmarks: [], position: null, revision: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
}
