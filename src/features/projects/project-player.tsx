"use client";
import { useEffect, useRef, useState } from "react";
import { BookmarkPlus, Play, Square, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { allBlocks, fingerprint, type PlaybackPosition, type Project } from "./model";
import { getAudio } from "./store";
import { nextPosition, validPosition } from "./playback";
export function ProjectPlayer({ project, chapterId, update, onActive }: { project: Project; chapterId: string; update: (change: (project: Project) => Project) => void; onActive: (id: string) => void }) {
  const audio = useRef<HTMLAudioElement>(null), url = useRef("");
  const latest = useRef(project), save = useRef(update), highlight = useRef(onActive);
  const token = useRef(0), timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sequence = useRef<string[]>([]), position = useRef<PlaybackPosition | null>(null), playingMark = useRef("");
  const [notice, setNotice] = useState("Choose a chapter or resume your last listening position.");
  const [rate, setRate] = useState(1), [active, setActive] = useState(false);
  const lastSaved = useRef(0), rateRef = useRef(1);
  useEffect(() => { latest.current = project; save.current = update; highlight.current = onActive;
    const block = allBlocks(project).find(block => block.id === position.current?.blockId);
    if (playingMark.current && (!block || fingerprint(block) !== playingMark.current)) {
      token.current++; if (timer.current) clearTimeout(timer.current); audio.current?.pause(); audio.current?.removeAttribute("src"); audio.current?.load(); playingMark.current = "";
      queueMicrotask(() => { setActive(false); setNotice("This section changed. Generate it again before listening."); onActive(""); });
    }
  }, [project, update, onActive]);
  useEffect(() => () => { token.current++; if (timer.current) clearTimeout(timer.current); if (url.current) URL.revokeObjectURL(url.current); }, []);
  function remember() {
    if (!position.current || !audio.current || !allBlocks(latest.current).some(block => block.id === position.current?.blockId)) return;
    const next = { ...position.current, seconds: audio.current.currentTime || 0 };
    position.current = next; save.current(project => ({ ...project, position: next }));
  }
  function stop() {
    token.current++; if (timer.current) clearTimeout(timer.current);
    audio.current?.pause(); remember(); setActive(false); highlight.current("");
  }
  async function load(next: PlaybackPosition, session: number) {
    const project = latest.current, block = allBlocks(project).find(block => block.id === next.blockId);
    if (!block || session !== token.current) return;
    next = validPosition(next, block);
    try {
      const mark = fingerprint(block), record = await getAudio(project.owner, project.id, block.id, next.chunk);
      if (session !== token.current) return;
      const current = allBlocks(latest.current).find(item => item.id === block.id);
      if (!record || record.fingerprint !== mark || !current || fingerprint(current) !== mark) throw new Error("Listening stopped at a missing or changed section. Generate it to continue.");
      if (url.current) URL.revokeObjectURL(url.current);
      url.current = URL.createObjectURL(record.blob); position.current = next; playingMark.current = mark;
      const element = audio.current!; element.src = url.current; element.playbackRate = rateRef.current;
      element.onloadedmetadata = () => { if (session === token.current) element.currentTime = Math.min(next.seconds, Math.max(0, element.duration - 0.05)); };
      highlight.current(block.id); setNotice(`Listening · ${project.chapters.find(chapter => chapter.blocks.some(item => item.id === block.id))?.title ?? "Project"}`);
      await element.play(); if (session === token.current) setActive(true);
    } catch (error) { if (session === token.current) { setNotice((error as Error).message); setActive(false); } }
  }
  function start(ids: string[], resume?: PlaybackPosition | null) {
    stop(); sequence.current = ids;
    const next = resume && ids.includes(resume.blockId) ? resume : ids[0] ? { blockId: ids[0], chunk: 0, seconds: 0 } : null;
    if (next) void load(next, token.current);
  }
  function ended() {
    const here = position.current;
    if (!here) return;
    const block = allBlocks(latest.current).find(block => block.id === here.blockId);
    if (!block) return;
    const available = new Set(allBlocks(latest.current).map(block => block.id));
    const next = nextPosition(here, block, sequence.current, available);
    if (!next) { setActive(false); setNotice("Finished listening."); highlight.current(""); remember(); return; }
    const session = token.current;
    timer.current = setTimeout(() => {
      if (session !== token.current) return;
      const blocks = allBlocks(latest.current), currentBlock = blocks.find(block => block.id === here.blockId);
      const upcoming = currentBlock && nextPosition(here, currentBlock, sequence.current, new Set(blocks.map(block => block.id)));
      if (upcoming) void load(upcoming, session);
      else { setActive(false); setNotice("Finished listening."); highlight.current(""); remember(); }
    }, next.blockId === here.blockId ? 0 : block.pause * 1000 / rateRef.current);
  }
  const ids = allBlocks(project).map(block => block.id), chapterIds = project.chapters.find(chapter => chapter.id === chapterId)?.blocks.map(block => block.id) ?? [];
  return <section className="project-player" aria-labelledby="listen-heading"><div className="projects-heading"><h3 id="listen-heading">Listen</h3><span role="status">{notice}</span></div><div className="project-actions"><Button variant="outline" onClick={() => start(chapterIds)} disabled={!chapterIds.length}><Play aria-hidden="true" />Listen to chapter</Button><Button variant="outline" onClick={() => start(ids, project.position)} disabled={!ids.length}>{project.position ? "Resume project" : "Listen to project"}</Button><Button variant="ghost" onClick={stop} disabled={!active}><Square aria-hidden="true" />Stop</Button></div>
    <audio ref={audio} controls preload="metadata" aria-label="Project audio" onEnded={ended} onPause={() => { if (audio.current && !audio.current.ended) { if (timer.current) clearTimeout(timer.current); setActive(false); remember(); } }} onPlay={() => setActive(true)} onTimeUpdate={() => { if (Date.now() - lastSaved.current > 3000) { lastSaved.current = Date.now(); remember(); } }} />
    <div className="project-actions"><label className="project-inline-field">Playback speed<select value={rate} onChange={event => { const next = Number(event.target.value); setRate(next); rateRef.current = next; if (audio.current) audio.current.playbackRate = next; }}>{[0.75, 1, 1.25, 1.5, 2].map(value => <option key={value} value={value}>{value}×</option>)}</select></label><Button variant="ghost" disabled={!active} onClick={() => { if (!position.current) return; const saved = { ...position.current, seconds: audio.current?.currentTime ?? 0 }; update(project => ({ ...project, bookmarks: [...project.bookmarks, { ...saved, id: crypto.randomUUID(), label: `Bookmark ${project.bookmarks.length + 1}` }] })); }}><BookmarkPlus aria-hidden="true" />Bookmark</Button></div>
    {project.bookmarks.length > 0 && <ul className="project-bookmarks">{project.bookmarks.map(bookmark => <li key={bookmark.id}><Button variant="link" onClick={() => start(ids, bookmark)}>{bookmark.label} · {Math.floor(bookmark.seconds)}s</Button><Button variant="ghost" aria-label={`Remove ${bookmark.label}`} onClick={() => update(project => ({ ...project, bookmarks: project.bookmarks.filter(item => item.id !== bookmark.id) }))}><Trash2 aria-hidden="true" /></Button></li>)}</ul>}
  </section>;
}
