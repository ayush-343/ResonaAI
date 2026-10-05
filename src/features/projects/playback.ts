import { speechChunks, type PlaybackPosition, type ProjectBlock } from "./model";
export function validPosition(position: PlaybackPosition, block: ProjectBlock): PlaybackPosition {
  return position.chunk >= 0 && position.chunk < speechChunks(block).length ? position : { blockId: block.id, chunk: 0, seconds: 0 };
}
export function nextPosition(position: PlaybackPosition, block: ProjectBlock, sequence: string[], currentIds: Set<string>): PlaybackPosition | null {
  if (position.chunk + 1 < speechChunks(block).length) return { ...position, chunk: position.chunk + 1, seconds: 0 };
  const next = sequence.slice(sequence.indexOf(position.blockId) + 1).find(id => currentIds.has(id));
  return next ? { blockId: next, chunk: 0, seconds: 0 } : null;
}
