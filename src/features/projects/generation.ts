import type { GenerateInput } from "../tts-engine/protocol";
import type { EngineResult } from "../tts-engine/use-tts-engine";
import { audioKey, fingerprint, projectKey, speechChunks, type AudioRevision, type ProjectBlock } from "./model";
export type AudioReader = (blockId: string, chunk: number) => Promise<AudioRevision | undefined>;
export async function blockProgress(block: ProjectBlock, read: AudioReader) {
  const chunks = speechChunks(block), mark = fingerprint(block);
  let done = 0;
  for (let i = 0; i < chunks.length; i++) if ((await read(block.id, i))?.fingerprint === mark) done++;
  return { done, total: chunks.length, ready: chunks.length > 0 && done === chunks.length };
}
export async function generateBlocks(options: {
  owner: string; projectId: string; blocks: ProjectBlock[]; read: AudioReader;
  write: (audio: AudioRevision) => Promise<void>; generate: (input: GenerateInput) => Promise<EngineResult>;
  current: (id: string) => ProjectBlock | undefined; cancelled: () => boolean;
  progress: (blockId: string, done: number, total: number) => void;
}) {
  for (const block of options.blocks) {
    const mark = fingerprint(block), chunks = speechChunks(block);
    for (let i = 0; i < chunks.length; i++) {
      if (options.cancelled()) return;
      const current = options.current(block.id);
      if (!current || fingerprint(current) !== mark) break;
      const previous = await options.read(block.id, i);
      if (options.cancelled()) return;
      if (previous?.fingerprint !== mark) {
        const result = await options.generate({ text: chunks[i], language: block.language, voiceId: block.voiceId, speed: block.speed });
        const latest = options.current(block.id);
        if (options.cancelled()) return;
        if (!latest || fingerprint(latest) !== mark) break;
        await options.write({ key: audioKey(options.owner, options.projectId, block.id, i), projectKey: projectKey(options.owner, options.projectId), blockId: block.id, chunk: i, fingerprint: mark, blob: new Blob([result.wav], { type: "audio/wav" }), duration: result.duration, backend: result.backend, elapsedMs: result.elapsedMs, firstAudioMs: result.firstAudioMs });
      }
      options.progress(block.id, i + 1, chunks.length);
    }
  }
}
