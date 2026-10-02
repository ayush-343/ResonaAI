"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowDownToLine, Check, CloudUpload, Loader2, Square, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTTSEngine } from "@/features/tts-engine/use-tts-engine";
import { ENGINE_VERSION, MODEL_ID, MODEL_REVISION, SAMPLES, TEXT_LIMIT, getVoice, voicesFor, type Backend, type LanguageMode, type VoiceId } from "@/features/tts-engine/catalog";
import { normalizeScript } from "@/features/tts-engine/text";
import { putLocalRecord } from "@/features/history/local-store";
import { saveToCloud } from "@/features/history/cloud-client";
import { HistoryPanel } from "@/features/history/history-panel";
import type { SpeechRecord } from "@/features/history/types";
import { readSpeechDraft, writeSpeechDraft } from "../draft-store";
import { readBackendPreference, writeBackendPreference } from "@/features/tts-engine/device-preferences";
import { SpeechWaveform } from "./speech-waveform";

export function SpeechStudio({ owner, initialText = "", initialVoice, initialLanguage, lab = false }: { owner: string; initialText?: string; initialVoice?: string; initialLanguage?: string; lab?: boolean }) {
  const startingVoice = getVoice(initialVoice ?? "") ?? getVoice("af_heart")!;
  const [text, setText] = useState(initialText);
  const [language, setLanguage] = useState<LanguageMode>(initialLanguage === "hinglish" && startingVoice.language === "hi" ? "hinglish" : startingVoice.language);
  const [voiceId, setVoiceId] = useState<VoiceId>(startingVoice.id);
  const [speed, setSpeed] = useState(1);
  const [pronunciation, setPronunciation] = useState("");
  const [backend, setBackend] = useState<Backend>("webgpu");
  const [result, setResult] = useState<SpeechRecord | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [draftSaved, setDraftSaved] = useState<boolean | null>(null);
  const currentDraft = useRef({ text, language, voiceId, speed, pronunciation, backend });
  const engine = useTTSEngine();
  const busy = engine.state.status === "loading" || engine.state.status === "generating";
  const ready = engine.state.status === "ready" && engine.state.backend === backend;

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      if (lab) { setDraftLoaded(true); return; }
      let preferredBackend: Backend | null = null;
      try { preferredBackend = readBackendPreference(localStorage); if (preferredBackend) setBackend(preferredBackend); } catch { /* Defaults work without storage. */ }
      let handedOff: string | null = null;
      try { handedOff = sessionStorage.getItem("resona-script-draft"); } catch { /* Draft recovery also works when session storage is unavailable. */ }
      if (!initialText && !handedOff) {
        try {
          const saved = readSpeechDraft(localStorage, owner);
          if (saved) {
            setText(saved.text);
            setBackend(preferredBackend ?? saved.backend);
            setSpeed(saved.speed);
            if (!initialVoice) {
              setLanguage(saved.language);
              setVoiceId(saved.voiceId);
              setPronunciation(saved.pronunciation);
            }
          }
        } catch { /* Blocked browser storage must not prevent editing. */ }
      } else if (!initialText && handedOff) setText(handedOff.slice(0, TEXT_LIMIT));
      // Consume after the active mount reads it; Strict Mode cleanup must
      // leave the draft available for the second setup.
      if (handedOff) try { sessionStorage.removeItem("resona-script-draft"); } catch { /* Storage failures must not discard the recovered text. */ }
      setDraftLoaded(true);
    });
    return () => { cancelled = true; };
  }, [initialText, initialVoice, owner, lab]);
  useEffect(() => {
    currentDraft.current = { text, language, voiceId, speed, pronunciation, backend };
    if (!draftLoaded || lab) return;
    const timer = window.setTimeout(() => {
      try { setDraftSaved(writeSpeechDraft(localStorage, owner, { text, language, voiceId, speed, pronunciation, backend })); }
      catch { setDraftSaved(false); }
    }, 400);
    return () => window.clearTimeout(timer);
  }, [draftLoaded, lab, owner, text, language, voiceId, speed, pronunciation, backend]);
  useEffect(() => {
    if (!draftLoaded || lab) return;
    const flush = () => {
      try { writeSpeechDraft(localStorage, owner, currentDraft.current); }
      catch { /* Closing the page must remain safe when storage is blocked. */ }
    };
    window.addEventListener("pagehide", flush);
    return () => { window.removeEventListener("pagehide", flush); flush(); };
  }, [draftLoaded, lab, owner]);
  useEffect(() => {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const frame = requestAnimationFrame(() => setAudioUrl(url));
    return () => { cancelAnimationFrame(frame); URL.revokeObjectURL(url); };
  }, [result]);

  const changeLanguage = (mode: LanguageMode) => { setLanguage(mode); setVoiceId(voicesFor(mode)[0].id); setPronunciation(""); };
  const generate = async () => {
    const script = normalizeScript(text), spoken = normalizeScript(pronunciation || text);
    if (!script || !spoken) { setNotice("Enter a script before generating speech."); return; }
    setNotice("");
    try {
      const audio = await engine.generate({ text: spoken, language, voiceId, speed });
      const record: SpeechRecord = {
        id: crypto.randomUUID(), owner, text: script, spokenText: spoken, language, voiceId, voiceName: getVoice(voiceId)!.name,
        speed, backend: audio.backend, modelId: MODEL_ID, modelRevision: MODEL_REVISION, engineVersion: ENGINE_VERSION,
        duration: audio.duration, elapsedMs: audio.elapsedMs, firstAudioMs: audio.firstAudioMs,
        createdAt: new Date().toISOString(), blob: new Blob([audio.wav], { type: "audio/wav" }), saved: false,
      };
      setResult(record);
      try { await putLocalRecord(record); } catch (error) { setNotice((error as Error).message); }
    } catch (error) { if ((error as Error).name !== "AbortError") setNotice((error as Error).message); }
  };
  const save = async () => {
    if (!result || saving) return;
    setSaving(true); setNotice("");
    try {
      await saveToCloud(result);
      const saved = { ...result, saved: true }; setResult(saved);
      try { await putLocalRecord(saved); } catch { setNotice("Saved to your workspace. The local copy could not be updated."); }
    } catch (error) { setNotice((error as Error).message); }
    finally { setSaving(false); }
  };

  return <div className="speech-studio">
    <div className="studio-main">
      <div className="studio-script">
        <div className="studio-section-header"><label htmlFor="speech-script" className="studio-title">Your script</label><Button type="button" variant="ghost" disabled={busy} onClick={() => { setText(SAMPLES[language]); setPronunciation(""); }}>Try a sample</Button></div>
        <textarea id="speech-script" value={text} onChange={event => setText(event.target.value)} onKeyDown={event => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter" && ready && !busy && !saving && text.trim()) { event.preventDefault(); void generate(); } }} disabled={busy} maxLength={TEXT_LIMIT} placeholder="Write or paste the words you want to hear…" className="studio-textarea" aria-describedby="script-help" />
        <div className="studio-script-footer"><span id="script-help">{draftSaved === true ? "Draft saved on this device" : draftSaved === false ? "Draft storage unavailable — keep a copy of your script" : "Speech is generated on your laptop."}</span><span className="tabular-nums">{text.length.toLocaleString()} / {TEXT_LIMIT.toLocaleString()}</span></div>
        {busy && engine.state.progress !== null && <progress className="studio-operation-progress" max={100} value={engine.state.progress} aria-label={engine.state.status === "loading" ? "Model download" : "Speech generation"} />}
        <div className="studio-action-bar"><p className={ready ? "device-ready" : undefined}>{busy ? engine.state.message : ready ? "Ready on this device · Ctrl / ⌘ + Enter" : "Open Model setup to load the speech engine."}</p>{busy ? <Button type="button" variant="outline" onClick={engine.cancel}><Square aria-hidden="true" />Cancel</Button> : <Button type="button" disabled={!ready || !text.trim() || saving} onClick={generate}><Volume2 aria-hidden="true" />Generate speech</Button>}</div>
      </div>
      <section className="studio-output" aria-labelledby="output-heading">
        <h2 id="output-heading">Latest generation</h2>
        {result ? <>
          <div className="output-summary"><strong>{result.voiceName}</strong><span>{result.language === "en" ? "English" : result.language === "hi" ? "Hindi" : "Hinglish"} · {result.duration.toFixed(1)} seconds</span></div>
          <SpeechWaveform blob={result.blob} />
          {audioUrl && <audio controls src={audioUrl} className="studio-audio" aria-label="Generated speech" />}
          <div className="output-actions"><Button variant="outline" asChild><a href={audioUrl} download={`resona-${result.voiceId}-${result.id.slice(0, 8)}.wav`}><ArrowDownToLine aria-hidden="true" />Download WAV</a></Button>{!lab && <Button variant="outline" onClick={save} disabled={saving || result.saved}>{saving ? <Loader2 className="motion-safe:animate-spin" aria-hidden="true" /> : result.saved ? <Check aria-hidden="true" /> : <CloudUpload aria-hidden="true" />}{saving ? "Saving…" : result.saved ? "Saved to workspace" : "Save to workspace"}</Button>}</div>
          <p className="studio-help">{result.saved ? "Text and audio are saved to your workspace." : lab ? "This benchmark keeps results on this device." : "Saving uploads your text and audio. You can download without saving."}</p>
          <details className="performance-details"><summary>Generation details</summary><dl><div><dt>Compute</dt><dd>{result.backend === "webgpu" ? "WebGPU · FP32" : "CPU · Q8"}</dd></div><div><dt>Generation time</dt><dd>{(result.elapsedMs / 1000).toFixed(2)} s</dd></div><div><dt>First generated chunk</dt><dd>{(result.firstAudioMs / 1000).toFixed(2)} s</dd></div><div><dt>Real-time factor</dt><dd>{(result.elapsedMs / 1000 / result.duration).toFixed(2)}×</dd></div></dl><p>First-chunk time measures generation; playback begins after the full result is assembled.</p></details>
        </> : <div className="output-empty"><Volume2 size={24} aria-hidden="true" /><p>Listen before you save.</p><span>Your generated speech will appear here, ready to play or download.</span></div>}
        {notice && <p className="studio-error" role="alert">{notice}</p>}
      </section>
      <HistoryPanel owner={owner} revision={`${result?.id ?? ""}:${result?.saved ?? false}`} lab={lab} />
    </div>
    <aside className="studio-controls" aria-labelledby="controls-heading">
      <h2 id="controls-heading">Speech settings</h2>
      <div className="studio-field"><label htmlFor="speech-language">Language</label><select id="speech-language" value={language} onChange={event => changeLanguage(event.target.value as LanguageMode)} disabled={busy}><option value="en">English</option><option value="hi">Hindi · experimental</option><option value="hinglish">Hinglish · experimental</option></select></div>
      <div className="studio-field"><label htmlFor="speech-voice">Voice</label><select id="speech-voice" value={voiceId} onChange={event => setVoiceId(event.target.value as VoiceId)} disabled={busy}>{voicesFor(language).map(voice => <option key={voice.id} value={voice.id}>{voice.name} — {voice.accent.replace(" · experimental", "")}</option>)}</select><p>{getVoice(voiceId)?.description}</p></div>
      <div className="studio-field"><label htmlFor="speech-speed">Speaking speed <span className="tabular-nums">{speed.toFixed(2)}×</span></label><input id="speech-speed" type="range" min="0.5" max="2" step="0.05" value={speed} onChange={event => setSpeed(Number(event.target.value))} disabled={busy} /><div className="range-labels"><span>Slower</span><span>Faster</span></div></div>
      {language !== "en" && <details className="pronunciation-details"><summary>Pronunciation</summary><p>For Romanized Hindi, enter the intended words in Devanagari below. Keep English words in Latin script in Hinglish mode. Your original script stays intact.</p><label htmlFor="pronunciation-script">Pronunciation version (optional)</label><textarea id="pronunciation-script" value={pronunciation} onChange={event => setPronunciation(event.target.value)} maxLength={TEXT_LIMIT} disabled={busy} placeholder="कल मेरी meeting तीन बजे है।" /></details>}
      <details className="model-section" open={!ready && engine.state.status !== "generating"}><summary id="model-heading">Model setup</summary><p>Kokoro · 82M parameters</p>
        <div className="studio-field"><label htmlFor="compute-backend">Run using</label><select id="compute-backend" value={backend} disabled={busy} onChange={event => { const next = event.target.value as Backend; setBackend(next); if (!lab) try { writeBackendPreference(localStorage, next); } catch { /* Choosing a backend does not require storage. */ } }}><option value="webgpu">GPU · WebGPU</option><option value="wasm">CPU · WebAssembly</option></select></div>
        <p className="studio-help">{backend === "webgpu" ? "326 MB model" : "93 MB model"}, plus pronunciation and runtime files. Downloads are cached when browser storage is available.</p>
        <Button type="button" variant="outline" className="model-load-button" disabled={busy || ready} onClick={() => { setNotice(""); void engine.load(backend).catch(error => setNotice(error.message)); }}>{engine.state.status === "loading" ? <Loader2 className="motion-safe:animate-spin" aria-hidden="true" /> : ready ? <Check aria-hidden="true" /> : <ArrowDownToLine aria-hidden="true" />}{ready ? "Model ready" : engine.state.status === "generating" ? "Model in use" : engine.state.status === "loading" ? "Loading model…" : "Download & load model"}</Button>
        <div className="model-status" role="status" aria-live="polite"><p>{engine.state.message}</p>{engine.state.progress !== null && <progress max={100} value={engine.state.progress} aria-label={engine.state.status === "loading" ? "Model download" : "Speech generation"} />}</div>
        {engine.state.status === "error" && <p className="studio-help">If GPU mode fails, select CPU and load the model again.</p>}
      </details>
      {language !== "en" && <p className="studio-help">Hindi and Hinglish are evaluation features. Listen carefully before using the output in published work.</p>}
    </aside>
  </div>;
}
