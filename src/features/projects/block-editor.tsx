"use client";
import { useRef } from "react";
import { ArrowUp, ArrowDown, Scissors, Trash2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { voicesFor, type LanguageMode, type VoiceId } from "../tts-engine/catalog";
import { assignSpeaker, changeLanguage, type ProjectBlock, type Speaker } from "./model";
export function BlockEditor({ block, index, total, speakers, status, active, canGenerate, change, move, remove, split, generate }: {
  block: ProjectBlock; index: number; total: number; speakers: Speaker[]; status: string; active: boolean; canGenerate: boolean;
  change: (block: ProjectBlock) => void; move: (delta: number) => void; remove: () => void; split: (offset: number) => void; generate: () => void;
}) {
  const textarea = useRef<HTMLTextAreaElement>(null);
  const prefix = `block-${block.id}`;
  return <article className={`project-block${active ? " is-playing" : ""}`} aria-label={`Block ${index + 1}`}>
    <div className="projects-heading"><h3>Block {index + 1}</h3><span>{active ? "Playing" : status}</span></div>
    <label htmlFor={`${prefix}-text`}>Script</label><textarea ref={textarea} id={`${prefix}-text`} value={block.text} rows={4} onChange={event => change({ ...block, text: event.target.value })} placeholder="Write the next part of your story…" />
    <div className="project-block-settings"><label>Speaker<select value={block.speakerId} onChange={event => { const speaker = speakers.find(item => item.id === event.target.value); if (speaker) change(assignSpeaker(block, speaker)); }}>{speakers.map(speaker => <option key={speaker.id} value={speaker.id}>{speaker.name}</option>)}</select></label><label>Language<select value={block.language} onChange={event => change(changeLanguage(block, event.target.value as LanguageMode))}><option value="en">English</option><option value="hi">Hindi · experimental</option><option value="hinglish">Hinglish · experimental</option></select></label><label>Voice<select value={block.voiceId} onChange={event => change({ ...block, voiceId: event.target.value as VoiceId })}>{voicesFor(block.language).map(voice => <option key={voice.id} value={voice.id}>{voice.name}</option>)}</select></label></div>
    <details><summary>Speed, pauses & pronunciation</summary><div className="project-block-settings"><label>Speaking speed<input type="number" min={0.5} max={2} step={0.05} value={block.speed} onChange={event => { const value = event.target.valueAsNumber; if (Number.isFinite(value) && value >= 0.5 && value <= 2) change({ ...block, speed: value }); }} /></label><label>Pause after block (seconds)<input type="number" min={0} max={10} step={0.1} value={block.pause} onChange={event => { const value = event.target.valueAsNumber; if (Number.isFinite(value) && value >= 0 && value <= 10) change({ ...block, pause: value }); }} /></label></div><label htmlFor={`${prefix}-pronunciation`}>Pronunciation override (optional)</label><textarea id={`${prefix}-pronunciation`} value={block.pronunciation} rows={2} onChange={event => change({ ...block, pronunciation: event.target.value })} /><p className="project-help">Replaces the spoken text for this block. Your original script is kept.</p></details>
    <div className="project-actions"><Button variant="outline" disabled={!canGenerate || !block.text.trim()} onClick={generate}><Volume2 aria-hidden="true" />Generate block</Button><Button variant="ghost" disabled={index === 0} aria-label={`Move block ${index + 1} up`} onClick={() => move(-1)}><ArrowUp aria-hidden="true" /></Button><Button variant="ghost" disabled={index === total - 1} aria-label={`Move block ${index + 1} down`} onClick={() => move(1)}><ArrowDown aria-hidden="true" /></Button><Button variant="ghost" onClick={() => split(textarea.current?.selectionStart ?? 0)}><Scissors aria-hidden="true" />Split at cursor</Button><Button variant="ghost" aria-label={`Delete block ${index + 1}`} onClick={remove}><Trash2 aria-hidden="true" /></Button></div>
  </article>;
}
