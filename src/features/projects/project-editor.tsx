"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Plus, ArrowUp, ArrowDown, Download, CloudUpload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTTSEngine } from "../tts-engine/use-tts-engine";
import { VOICES, type Backend, type VoiceId } from "../tts-engine/catalog";
import { saveToCloud } from "../history/cloud-client";
import { readBackendPreference, writeBackendPreference } from "../tts-engine/device-preferences";
import { allBlocks, fingerprint, moveItem, newBlock, splitBlock, textCount, type Chapter, type ProjectBlock } from "./model";
import { getAudio, putAudio } from "./store";
import { blockProgress, generateBlocks } from "./generation";
import { cloudExportRecord, exportWav } from "./export";
import { useProject } from "./use-project";
import { BlockEditor } from "./block-editor";
import { ProjectPlayer } from "./project-player";
import "./projects.css";
export function ProjectEditor({ owner, orgId, id }: { owner: string; orgId: string; id: string }) {
  const { project, current, update, flush, loaded, status, error } = useProject(owner, id);
  const [chapterId, setChapterId] = useState(""), [activeBlock, setActiveBlock] = useState("");
  const [backend, setBackend] = useState<Backend>("webgpu"), [notice, setNotice] = useState("");
  const [generating, setGenerating] = useState(false), [exporting, setExporting] = useState(false);
  const [audioVersion, setAudioVersion] = useState(0), [progress, setProgress] = useState<Record<string, string>>({});
  const cancelled = useRef(false), running = useRef(false), mounted = useRef(true);
  const engine = useTTSEngine();
  const read = useCallback((blockId: string, chunk: number) => getAudio(owner, id, blockId, chunk), [owner, id]);
  useEffect(() => { mounted.current = true; queueMicrotask(() => { if (mounted.current) try { setBackend(readBackendPreference(localStorage) ?? "webgpu"); } catch { /* Default works without preferences. */ } }); return () => { mounted.current = false; cancelled.current = true; }; }, []);
  const audioSignature = project ? JSON.stringify(allBlocks(project).map(block => [block.id, fingerprint(block)])) : "";
  useEffect(() => {
    let disposed = false;
    const snapshot = current.current;
    if (!snapshot) return;
    const check = async () => {
      const next: Record<string, string> = {};
      for (const block of allBlocks(snapshot)) { if (disposed) return; const value = await blockProgress(block, read); next[block.id] = value.ready ? "Ready" : value.total === 0 ? "Empty" : value.done ? `${value.done}/${value.total} sections ready` : "Needs generation"; }
      if (!disposed) setProgress(next);
    };
    const timer = setTimeout(() => { void check().catch(error => { if (!disposed) setNotice(error.message); }); }, 200);
    return () => { disposed = true; clearTimeout(timer); };
  }, [audioSignature, current, read, audioVersion]);
  const handleActive = useCallback((blockId: string) => {
    setActiveBlock(blockId);
    const containing = current.current?.chapters.find(chapter => chapter.blocks.some(block => block.id === blockId));
    if (containing) setChapterId(containing.id);
  }, [current]);
  const chapter = project?.chapters.find(chapter => chapter.id === chapterId) ?? project?.chapters[0];
  const busy = generating || engine.state.status === "loading";
  const ready = engine.state.status === "ready" && engine.state.backend === backend && !busy;
  function editChapter(change: (chapter: Chapter) => Chapter) {
    if (!chapter) return;
    update(project => ({ ...project, chapters: project.chapters.map(item => item.id === chapter.id ? change(item) : item) }));
  }
  function removeBlock(blockId: string) {
    if (!window.confirm("Remove this block from the project?")) return;
    update(project => ({ ...project, chapters: project.chapters.map(item => ({ ...item, blocks: item.blocks.filter(block => block.id !== blockId) })), bookmarks: project.bookmarks.filter(item => item.blockId !== blockId), position: project.position?.blockId === blockId ? null : project.position }));
  }
  async function generate(blocks: ProjectBlock[]) {
    if (running.current || !ready) return;
    running.current = true; cancelled.current = false; setGenerating(true); setNotice("Generating missing or changed sections…");
    try {
      await flush();
      await generateBlocks({ owner, projectId: id, blocks, read, write: putAudio, generate: engine.generate, current: blockId => current.current ? allBlocks(current.current).find(block => block.id === blockId) : undefined, cancelled: () => cancelled.current, progress: () => { if (mounted.current) setAudioVersion(value => value + 1); } });
      if (mounted.current) setNotice(cancelled.current ? "Generation cancelled. Completed sections are saved." : "Queue finished. Edited sections may need another generation pass.");
    } catch (error) { if (mounted.current) setNotice((error as Error).name === "AbortError" ? "Generation cancelled. Completed sections are saved." : (error as Error).message); }
    finally { running.current = false; if (mounted.current) { setGenerating(false); setAudioVersion(value => value + 1); } }
  }
  async function exportAudio(blocks: ProjectBlock[], cloud: boolean, title: string) {
    setExporting(true); setNotice("");
    try {
      const blob = await exportWav(blocks, read);
      if (cloud) { const record = await cloudExportRecord(blocks, read, blob, orgId); await saveToCloud(record); setNotice("Export saved to workspace history. The editable project stays on this device."); }
      else {
        const url = URL.createObjectURL(blob), link = document.createElement("a");
        link.href = url; link.download = `${title.replace(/[^\p{L}\p{N}\s_-]/gu, "").trim() || "resona-project"}.wav`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 60_000);
        setNotice("WAV export ready. Your project stays on this device.");
      }
    } catch (error) { setNotice((error as Error).message); }
    finally { setExporting(false); }
  }
  if (!project) return <div className="projects-page"><p role="status">{loaded ? status : "Loading project…"}</p>{error && <p role="alert" className="project-error">{error}</p>}<Link href="/projects">Back to projects</Link></div>;
  const blocks = allBlocks(project), complete = blocks.length > 0 && blocks.every(block => progress[block.id] === "Ready");
  const chapterComplete = !!chapter?.blocks.length && chapter.blocks.every(block => progress[block.id] === "Ready");
  return <div className="projects-page project-editor">
    <Link href="/projects" className="project-back">All projects</Link>
    <header className="projects-heading"><div className="project-title-field"><label htmlFor="project-title">Project title</label><input id="project-title" value={project.title} maxLength={160} onChange={event => update(project => ({ ...project, title: event.target.value }))} /><p role="status">{status} · {textCount(project).toLocaleString()} / 100,000 characters</p></div><Button variant="outline" disabled={exporting || !complete || busy} onClick={() => void exportAudio(blocks, false, project.title)}><Download aria-hidden="true" />{exporting ? "Preparing export…" : "Export project WAV"}</Button></header>
    {error && <div className="project-error" role="alert"><p>{error}</p><Button variant="outline" onClick={() => void flush().catch(() => {})}>Retry saving</Button></div>}
    {notice && <p className="project-notice" role="status">{notice}</p>}
    <div className="project-editor-layout"><aside className="project-outline" aria-label="Chapters and model setup"><h3>Chapters</h3><ol>{project.chapters.map((item, index) => <li key={item.id}><button type="button" className={chapter?.id === item.id ? "selected" : ""} aria-current={chapter?.id === item.id ? "true" : undefined} onClick={() => setChapterId(item.id)}><span>{index + 1}. {item.title}</span><small>{item.blocks.length} blocks</small></button></li>)}</ol><Button variant="outline" onClick={() => { const next = { id: crypto.randomUUID(), title: `Chapter ${project.chapters.length + 1}`, blocks: [newBlock(project.speakers[0])] }; update(project => ({ ...project, chapters: [...project.chapters, next] })); setChapterId(next.id); }}><Plus aria-hidden="true" />Add chapter</Button>
    <section className="project-model"><h3>Speech engine</h3><label htmlFor="project-backend">Run using</label><select id="project-backend" value={backend} disabled={busy} onChange={event => { const value = event.target.value as Backend; setBackend(value); try { writeBackendPreference(localStorage, value); } catch { /* Preference is optional. */ } }}><option value="webgpu">GPU · WebGPU</option><option value="wasm">CPU · WebAssembly</option></select><p className="project-help">Kokoro · {backend === "webgpu" ? "326 MB" : "93 MB"} model, plus runtime files. Generation runs on this device.</p><Button variant="outline" disabled={busy || ready} onClick={() => void engine.load(backend).catch(error => setNotice(error.message))}>{ready ? "Model ready" : engine.state.status === "loading" ? "Loading model…" : "Download & load model"}</Button><p role="status" className="project-help">{engine.state.message}</p>{engine.state.progress !== null && <progress aria-label="Engine progress" max={100} value={engine.state.progress} />}{busy ? <Button variant="outline" onClick={() => { cancelled.current = true; engine.cancel(); }}>Cancel generation</Button> : <Button disabled={!ready || !blocks.some(block => block.text.trim())} onClick={() => void generate(blocks)}>Generate unfinished</Button>}</section>
    <details className="project-speakers"><summary>Cast · {project.speakers.length} speakers</summary><p className="project-help">Choose a default voice for each speaker. Existing blocks keep their own settings; select the speaker again to apply a new default.</p>{project.speakers.map(speaker => <div className="project-speaker" key={speaker.id}><label>Speaker name<input value={speaker.name} maxLength={80} onChange={event => update(project => ({ ...project, speakers: project.speakers.map(item => item.id === speaker.id ? { ...item, name: event.target.value } : item) }))} /></label><label>Default voice<select value={speaker.voiceId} onChange={event => update(project => ({ ...project, speakers: project.speakers.map(item => item.id === speaker.id ? { ...item, voiceId: event.target.value as VoiceId } : item) }))}>{VOICES.map(voice => <option key={voice.id} value={voice.id}>{voice.name} · {voice.language === "en" ? "English" : "Hindi"}</option>)}</select></label></div>)}<Button variant="outline" onClick={() => update(project => ({ ...project, speakers: [...project.speakers, { id: crypto.randomUUID(), name: `Speaker ${project.speakers.length + 1}`, voiceId: "af_bella" }] }))}><Plus aria-hidden="true" />Add speaker</Button></details></aside>
    <div className="project-script">{chapter && <><div className="chapter-header"><label htmlFor="chapter-title">Chapter title</label><input id="chapter-title" value={chapter.title} maxLength={160} onChange={event => editChapter(chapter => ({ ...chapter, title: event.target.value }))} /><div className="project-actions"><Button variant="outline" disabled={!ready || !chapter.blocks.some(block => block.text.trim())} onClick={() => void generate(chapter.blocks)}>Generate chapter</Button><Button variant="ghost" disabled={project.chapters[0].id === chapter.id} aria-label="Move chapter up" onClick={() => update(project => ({ ...project, chapters: moveItem(project.chapters, project.chapters.findIndex(item => item.id === chapter.id), -1) }))}><ArrowUp aria-hidden="true" /></Button><Button variant="ghost" disabled={project.chapters.at(-1)?.id === chapter.id} aria-label="Move chapter down" onClick={() => update(project => ({ ...project, chapters: moveItem(project.chapters, project.chapters.findIndex(item => item.id === chapter.id), 1) }))}><ArrowDown aria-hidden="true" /></Button><Button variant="ghost" disabled={project.chapters.length === 1} aria-label="Delete chapter" onClick={() => { if (window.confirm(`Delete chapter “${chapter.title}” and its script?`)) { const ids = new Set(chapter.blocks.map(block => block.id)); update(project => ({ ...project, chapters: project.chapters.filter(item => item.id !== chapter.id), bookmarks: project.bookmarks.filter(item => !ids.has(item.blockId)), position: project.position && ids.has(project.position.blockId) ? null : project.position })); } }}><Trash2 aria-hidden="true" /></Button></div></div>
    {chapter.blocks.map((block, index) => <BlockEditor key={block.id} block={block} index={index} total={chapter.blocks.length} speakers={project.speakers} status={progress[block.id] ?? "Checking audio…"} active={activeBlock === block.id} canGenerate={ready} change={next => editChapter(chapter => ({ ...chapter, blocks: chapter.blocks.map(item => item.id === next.id ? next : item) }))} move={delta => editChapter(chapter => ({ ...chapter, blocks: moveItem(chapter.blocks, index, delta) }))} remove={() => removeBlock(block.id)} split={offset => { try { const pair = splitBlock(block, offset); editChapter(chapter => ({ ...chapter, blocks: chapter.blocks.flatMap(item => item.id === block.id ? pair : [item]) })); } catch (error) { setNotice((error as Error).message); } }} generate={() => void generate([block])} />)}
    <Button variant="outline" onClick={() => editChapter(chapter => ({ ...chapter, blocks: [...chapter.blocks, newBlock(project.speakers[0])] }))}><Plus aria-hidden="true" />Add block</Button>
    <section className="project-export"><h3>Keep a copy</h3><p>Generate all sections before exporting. Workspace saving uploads the selected chapter’s text and audio; the editable project stays local.</p><div className="project-actions"><Button variant="outline" disabled={!chapterComplete || exporting || busy} onClick={() => void exportAudio(chapter.blocks, false, chapter.title)}><Download aria-hidden="true" />Download chapter</Button><Button variant="outline" disabled={!chapterComplete || exporting || busy} onClick={() => void exportAudio(chapter.blocks, true, chapter.title)}><CloudUpload aria-hidden="true" />Save chapter to workspace</Button></div><p className="project-help">Cloud history accepts a single voice, language, speed, and compute backend, up to 5,000 characters, 20 minutes, and 25 MB. Multi-speaker chapters can be downloaded.</p></section>
    </>}</div></div>
    <ProjectPlayer project={project} chapterId={chapter?.id ?? ""} update={update} onActive={handleActive} />
  </div>;
}
