import { test } from "node:test";
import assert from "node:assert/strict";
import "fake-indexeddb/auto";
import { allBlocks, assignSpeaker, audioKey, cloneProject, fingerprint, newProject, ownerKey, projectKey, speechChunks, splitBlock, type AudioRevision, type ProjectBlock } from "../src/features/projects/model";
import { deleteProject, getAudio, getProject, listProjects, putAudio, saveProject } from "../src/features/projects/store";
import { extractDocument, projectFromText, validateExtractedText, validateImport } from "../src/features/projects/import";
import { blockProgress, generateBlocks } from "../src/features/projects/generation";
import { cloudExportRecord, exportWav } from "../src/features/projects/export";
import { encodeWav } from "../src/features/tts-engine/audio";
import { SAMPLE_RATE } from "../src/features/tts-engine/catalog";
const fixture = () => { const project = newProject(ownerKey(crypto.randomUUID(), "org")); project.chapters[0].blocks[0].text = "Hello world."; return project; };
function revision(block: ProjectBlock, chunk = 0): AudioRevision {
  return { key: "test", projectKey: "test", blockId: block.id, chunk, fingerprint: fingerprint(block), blob: new Blob([encodeWav(new Float32Array([0.25, -0.5]), SAMPLE_RATE)]), duration: 2 / SAMPLE_RATE, backend: "wasm", elapsedMs: 1, firstAudioMs: 1 };
}
test("imports preserve Hindi and explicit chapter boundaries without silent truncation", async () => {
  const text = "# शुरुआत\nनमस्ते दुनिया।\n\nदूसरा अनुच्छेद।\n# Next\nHello.";
  const result = await extractDocument(new File([text], "story.TXT"));
  assert.equal(result, text);
  const project = projectFromText("owner", "Book", result);
  assert.equal(project.chapters.length, 2); assert.equal(project.chapters[0].title, "शुरुआत");
  assert.equal(project.chapters[0].blocks.length, 2); assert.equal(allBlocks(project)[0].text, "नमस्ते दुनिया।");
  assert.throws(() => validateImport({ name: "a.pdf", size: 20 * 1024 * 1024 + 1 }), /20 MB/);
  assert.throws(() => validateImport({ name: "a.exe", size: 4 }), /Choose/);
  assert.throws(() => validateExtractedText("a".repeat(100001)), /100,000/);
  assert.throws(() => validateExtractedText("  "), /No readable/);
  assert.throws(() => projectFromText("owner", "Book", "# Only heading"), /Add some script/);
  await assert.rejects(extractDocument(new File(["not a zip"], "bad.docx")), /DOCX could not/);
});
test("splitting retains text and pauses, rejects ambiguous pronunciation splits", () => {
  const block = allBlocks(fixture())[0]; block.text = "Hello. Goodbye."; block.pause = 2;
  const [a, b] = splitBlock(block, 6); assert.equal(a.text + b.text, block.text); assert.equal(b.pause, 2); assert.notEqual(a.id, b.id);
  assert.throws(() => splitBlock({ ...block, pronunciation: "override" }, 6), /override/);
});
test("chunk requests respect UTF-16 limits and preserve Unicode", () => {
  const block = allBlocks(fixture())[0]; block.text = "😀".repeat(6000);
  const chunks = speechChunks(block); assert.equal(chunks.join(""), block.text);
  assert.ok(chunks.every(text => text.length <= 5000 && !/[\uD800-\uDBFF]$/.test(text)));
});
test("speech fingerprint ignores ordering and pauses but tracks all audible settings", () => {
  const block = allBlocks(fixture())[0], mark = fingerprint(block);
  assert.equal(fingerprint({ ...block, pause: 5 }), mark);
  for (const changed of [{ ...block, text: "New" }, { ...block, voiceId: "af_bella" as const }, { ...block, pronunciation: "new" }, { ...block, speed: 1.5 }, { ...block, language: "hinglish" as const }]) assert.notEqual(fingerprint(changed), mark);
  assert.equal(assignSpeaker(block, { id: "h", name: "Hindi", voiceId: "hf_alpha" }).language, "hi");
});
test("device storage persists and isolates users/workspaces; stale tabs cannot overwrite", async () => {
  const project = await saveProject(fixture());
  assert.equal((await getProject(project.owner, project.id))?.revision, 1);
  assert.equal(await getProject(ownerKey("other", "org"), project.id), undefined);
  assert.equal((await listProjects(ownerKey("other", "org"))).length, 0);
  const saved = await saveProject({ ...project, title: "Changed", position: { blockId: allBlocks(project)[0].id, chunk: 0, seconds: 4 }, bookmarks: [{ id: "bookmark", label: "Here", blockId: allBlocks(project)[0].id, chunk: 0, seconds: 2 }] });
  await assert.rejects(saveProject(project), /another tab/);
  const restored = await getProject(saved.owner, saved.id); assert.equal(restored?.position?.seconds, 4); assert.equal(restored?.bookmarks[0].label, "Here");
  const copy = cloneProject(saved); assert.notEqual(copy.id, saved.id); assert.notEqual(allBlocks(copy)[0].id, allBlocks(saved)[0].id); assert.equal(copy.position, null);
  const block = allBlocks(saved)[0], audio = { ...revision(block), key: audioKey(saved.owner, saved.id, block.id, 0), projectKey: projectKey(saved.owner, saved.id) };
  await putAudio(audio); assert.ok(await getAudio(saved.owner, saved.id, block.id, 0));
  assert.equal(await getAudio("another-owner", saved.id, block.id, 0), undefined);
  await deleteProject(saved.owner, saved.id); assert.equal(await getProject(saved.owner, saved.id), undefined); assert.equal(await getAudio(saved.owner, saved.id, block.id, 0), undefined);
  await assert.rejects(putAudio(audio), /storage/);
});
test("queue resumes persisted sections and discards results changed during generation", async () => {
  const project = fixture(), block = allBlocks(project)[0]; block.text = "x".repeat(10001);
  const stored = new Map<number, AudioRevision>([[0, revision(block, 0)]]); let calls = 0, current = block;
  const options = { owner: project.owner, projectId: project.id, blocks: [block], read: async (_id: string, i: number) => stored.get(i), write: async (audio: AudioRevision) => { stored.set(audio.chunk, audio); }, current: () => current, cancelled: () => false, progress: () => {}, generate: async () => { calls++; return { type: "result" as const, id: "r", wav: encodeWav(new Float32Array([0.2]), SAMPLE_RATE), duration: 1 / SAMPLE_RATE, backend: "wasm" as const, elapsedMs: 1, firstAudioMs: 1 }; } };
  await generateBlocks(options); assert.equal(calls, 2); assert.equal((await blockProgress(block, options.read)).ready, true);
  await generateBlocks(options); assert.equal(calls, 2);
  stored.clear(); await generateBlocks({ ...options, generate: async () => { current = { ...block, text: "changed" }; return options.generate(); } }); assert.equal(stored.size, 0);
});
test("cancellation and generation failures retain completed chunks", async () => {
  const project = fixture(), block = allBlocks(project)[0]; block.text = "x".repeat(10001);
  const stored = new Map<number, AudioRevision>(); let cancel = false;
  const options = { owner: project.owner, projectId: project.id, blocks: [block], read: async (_id: string, i: number) => stored.get(i), write: async (audio: AudioRevision) => { stored.set(audio.chunk, audio); }, current: () => block, cancelled: () => cancel, progress: () => { cancel = true; }, generate: async () => ({ type: "result" as const, id: "r", wav: encodeWav(new Float32Array([0.2]), SAMPLE_RATE), duration: 1 / SAMPLE_RATE, backend: "wasm" as const, elapsedMs: 1, firstAudioMs: 1 }) };
  await generateBlocks(options); assert.equal(stored.size, 1);
  cancel = false; await assert.rejects(generateBlocks({ ...options, progress: () => {}, generate: async () => { throw new Error("GPU lost"); } }), /GPU lost/); assert.equal(stored.size, 1);
  await assert.rejects(generateBlocks({ ...options, progress: () => {}, write: async () => { throw new Error("Storage full"); } }), /Storage full/); assert.equal(stored.size, 1);
});
test("WAV export orders PCM, inserts pauses, and refuses missing or stale audio", async () => {
  const block = allBlocks(fixture())[0]; block.pause = 0.1;
  const read = async () => revision(block), blob = await exportWav([block, block], read);
  assert.equal(blob.size, 44 + 8 + SAMPLE_RATE * 0.2 * 2);
  const view = new DataView(await blob.arrayBuffer()); assert.equal(view.getUint32(40, true), blob.size - 44); assert.equal(view.getInt16(44, true), 8192); assert.equal(view.getInt16(48, true), 0);
  await assert.rejects(exportWav([block], async () => undefined), /missing/);
  await assert.rejects(exportWav([{ ...block, speed: 1.4 }], read), /changed/);
  const record = await cloudExportRecord([block], read, await exportWav([block], read), "org"); assert.equal(record.owner, "org");
  await assert.rejects(cloudExportRecord([block, { ...block, voiceId: "af_bella" }], read, blob, "org"), /one voice/);
  await assert.rejects(cloudExportRecord([{ ...block, text: "x".repeat(5001) }], async () => revision({ ...block, text: "x".repeat(5001) }), blob, "org"), /5,000/);
});

test("DOCX extraction returns raw bilingual text and chapter review remains editable", async () => {
  const { readFile } = await import("node:fs/promises");
  const bytes = await readFile("tests/fixtures/document.docx");
  const text = await extractDocument(new File([bytes], "document.docx"));
  assert.match(text, /Hello from a document\./); assert.match(text, /नमस्ते दुनिया।/); assert.ok(!text.includes("<w:"));
  const edited = text.replace("# Introduction", "# Revised opening");
  assert.equal(projectFromText("owner", "Book", edited).chapters[0].title, "Revised opening");
});
test("PDF page extraction preserves order and rejects image-only or excessive documents", async () => {
  const { readPdfText } = await import("../src/features/projects/import");
  const document = { numPages: 2, getPage: async (number: number) => ({ getTextContent: async () => ({ items: [{ str: number === 1 ? "First page" : "दूसरा पृष्ठ", hasEOL: true }] }), cleanup: () => {} }) };
  assert.equal(await readPdfText(document), "First page\n\nदूसरा पृष्ठ");
  await assert.rejects(readPdfText({ ...document, getPage: async () => ({ getTextContent: async () => ({ items: [] }), cleanup: () => {} }) }), /no selectable text/);
  await assert.rejects(readPdfText({ ...document, getPage: async () => ({ getTextContent: async () => ({ items: [{ str: "a".repeat(100001) }] }), cleanup: () => {} }) }), /100,000/);
});
test("successful script saves prune obsolete audio but preserve reusable audio on pause changes", async () => {
  let project = fixture(); project.chapters[0].blocks[0].text = "x".repeat(6000); project = await saveProject(project);
  const block = allBlocks(project)[0];
  const write = async (chunk: number) => putAudio({ ...revision(block, chunk), key: audioKey(project.owner, project.id, block.id, chunk), projectKey: projectKey(project.owner, project.id) });
  await write(0); await write(1);
  project.chapters[0].blocks[0] = { ...block, pause: 1 }; project = await saveProject(project);
  assert.ok(await getAudio(project.owner, project.id, block.id, 1));
  project.chapters[0].blocks[0] = { ...block, text: "Shortened" }; project = await saveProject(project);
  assert.equal(await getAudio(project.owner, project.id, block.id, 0), undefined); assert.equal(await getAudio(project.owner, project.id, block.id, 1), undefined);
  await assert.rejects(write(0));
  const next = allBlocks(project)[0]; await putAudio({ ...revision(next), key: audioKey(project.owner, project.id, next.id, 0), projectKey: projectKey(project.owner, project.id) });
  project.chapters[0].blocks = []; project = await saveProject(project);
  assert.equal(await getAudio(project.owner, project.id, next.id, 0), undefined);
});

test("a failed metadata save leaves the previous durable project intact", async () => {
  const project = await saveProject(fixture());
  const original = IDBDatabase.prototype.transaction;
  IDBDatabase.prototype.transaction = function (...args: Parameters<IDBDatabase["transaction"]>) {
    if (args[1] === "readwrite") throw new DOMException("Quota exceeded", "QuotaExceededError");
    return original.apply(this, args);
  };
  try { await assert.rejects(saveProject({ ...project, title: "Unsaved" }), /Quota/); }
  finally { IDBDatabase.prototype.transaction = original; }
  assert.equal((await getProject(project.owner, project.id))?.title, project.title);
});

test("playback restarts shortened blocks and skips deleted upcoming blocks", async () => {
  const { validPosition, nextPosition } = await import("../src/features/projects/playback");
  const block = allBlocks(fixture())[0];
  const stale = { blockId: block.id, chunk: 4, seconds: 30 };
  assert.deepEqual(validPosition(stale, block), { blockId: block.id, chunk: 0, seconds: 0 });
  assert.deepEqual(nextPosition({ ...stale, chunk: 0 }, block, [block.id, "deleted", "kept"], new Set([block.id, "kept"])), { blockId: "kept", chunk: 0, seconds: 0 });
  assert.equal(nextPosition({ ...stale, chunk: 0 }, block, [block.id, "deleted"], new Set([block.id])), null);
});

test("next section is resolved again after an inter-block pause", async () => {
  const { nextPosition } = await import("../src/features/projects/playback");
  const block = allBlocks(fixture())[0], position = { blockId: block.id, chunk: 0, seconds: 0 };
  const sequence = [block.id, "removed-during-pause", "remaining"];
  let ids = new Set(sequence);
  const afterPause = () => nextPosition(position, block, sequence, ids);
  assert.equal(afterPause()?.blockId, "removed-during-pause");
  ids = new Set([block.id, "remaining"]);
  assert.equal(afterPause()?.blockId, "remaining");
  ids = new Set([block.id]); assert.equal(afterPause(), null);
});

test("PDF.js reads a real two-page PDF into reviewable chapters", async () => {
  const { readFile } = await import("node:fs/promises");
  const { createRequire } = await import("node:module");
  const pdf = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const { readPdfText } = await import("../src/features/projects/import");
  const require = createRequire(import.meta.url);
  pdf.GlobalWorkerOptions.workerSrc = require.resolve("pdfjs-dist/legacy/build/pdf.worker.mjs");
  const task = pdf.getDocument({ data: new Uint8Array(await readFile("tests/fixtures/chapters.pdf")), useSystemFonts: true });
  try {
    const project = projectFromText("test-owner", "PDF", await readPdfText(await task.promise));
    assert.deepEqual(project.chapters.map(chapter => chapter.title), ["Opening", "Next chapter"]);
    assert.equal(project.chapters[1].blocks[0].text, "This is the second chapter.");
  } finally { await task.destroy(); }
  const invalid = pdf.getDocument({ data: new TextEncoder().encode("not a PDF") });
  try { await assert.rejects(invalid.promise, /PDF/); }
  finally { await invalid.destroy(); }
});
