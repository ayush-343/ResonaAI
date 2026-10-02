"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, AudioLines, FileAudio, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./voice-clone.css";

const SAMPLE_LIMIT = 20 * 1024 * 1024;
const AUDIO_EXTENSIONS = /\.(wav|mp3|m4a|ogg|webm)$/i;

export function VoiceCloneSetup() {
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("en");
  const [description, setDescription] = useState("");
  const [consent, setConsent] = useState(false);
  const [sample, setSample] = useState<{ file: File; url: string } | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (sample) URL.revokeObjectURL(sample.url); }, [sample]);

  function selectSample(file: File | undefined) {
    setReviewing(false); setDuration(null); setError(""); setSample(null);
    if (!file) return;
    if (!AUDIO_EXTENSIONS.test(file.name)) setError("Choose a WAV, MP3, M4A, OGG or WebM audio file.");
    else if (file.size === 0) setError("This recording is empty. Choose another audio file.");
    else if (file.size > SAMPLE_LIMIT) setError("This recording exceeds 20 MB. Choose a smaller audio file.");
    else { setSample({ file, url: URL.createObjectURL(file) }); return; }
    if (fileInput.current) fileInput.current.value = "";
  }

  const canReview = name.trim().length > 0 && consent && sample !== null && duration !== null && !error;
  const languageName = language === "en" ? "English" : language === "hi" ? "Hindi" : "Hinglish";

  return <section className="clone-setup" aria-labelledby="clone-heading">
    <div className="clone-heading-row"><h2 id="clone-heading">Set up a voice clone</h2><span className="clone-preview-label">Frontend preview</span></div>
    <p className="workspace-description" id="clone-availability">Explore the setup with a recording. Voice cloning is not connected yet, so this preview cannot create a voice or generate speech.</p>
    {reviewing ? <div className="clone-review" role="region" aria-label="Voice setup preview">
      <AudioLines size={28} aria-hidden="true" />
      <h3>{name.trim()}</h3><p>{languageName} · Setup preview</p>
      {description.trim() && <p className="clone-description">{description.trim()}</p>}
      <p className="studio-help">Your sample is ready for review below. This is a draft setup, not a cloned voice. It will not appear in the speech editor.</p>
      <div className="output-actions"><Button variant="outline" onClick={() => setReviewing(false)}><ArrowLeft aria-hidden="true" />Edit setup</Button><Button disabled aria-describedby="clone-availability">Cloning unavailable</Button></div>
    </div> : <form onSubmit={event => { event.preventDefault(); if (canReview) setReviewing(true); }}>
      <div className="clone-fields">
        <div className="studio-field"><label htmlFor="clone-name">Voice name</label><input id="clone-name" value={name} onChange={event => setName(event.target.value)} maxLength={80} placeholder="For example, My narration voice" required /></div>
        <div className="studio-field"><label htmlFor="clone-language">Sample language</label><select id="clone-language" value={language} onChange={event => setLanguage(event.target.value)}><option value="en">English</option><option value="hi">Hindi</option><option value="hinglish">Hinglish</option></select></div>
      </div>
      <div className="studio-field"><label htmlFor="clone-description">Description (optional)</label><textarea id="clone-description" value={description} onChange={event => setDescription(event.target.value)} maxLength={240} rows={2} placeholder="What will you use this voice for?" /></div>
      <div className="clone-recording-field"><label htmlFor="clone-recording">Voice recording</label><p id="clone-recording-help" className="studio-help">Choose a clear recording of one speaker. WAV, MP3, M4A, OGG or WebM, up to 20 MB. Playback depends on your browser’s audio support.</p><input ref={fileInput} id="clone-recording" type="file" accept=".wav,.mp3,.m4a,.ogg,.webm,audio/wav,audio/mpeg,audio/mp4,audio/ogg,audio/webm" onChange={event => selectSample(event.target.files?.[0])} aria-describedby="clone-recording-help clone-local-note" aria-invalid={Boolean(error)} /></div>
      <label className="clone-consent"><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} required /><span>This is my voice, or I have permission from the speaker to use their recording for a voice clone.</span></label>
      <div className="clone-action-row"><Button type="submit" disabled={!canReview}>Review voice setup</Button><span className="studio-help">Name, playable recording and permission required.</span></div>
    </form>}
    {sample && <div className="clone-sample">
      <div className="clone-sample-header"><div><FileAudio aria-hidden="true" size={20} /><span>{sample.file.name}</span></div><Button variant="ghost" size="sm" aria-label="Remove sample recording" onClick={() => { setSample(null); setDuration(null); setReviewing(false); setError(""); if (fileInput.current) fileInput.current.value = ""; }}><X aria-hidden="true" />Remove</Button></div>
      <audio key={sample.url} controls preload="metadata" src={sample.url} className="studio-audio" aria-label="Original voice recording" onLoadedMetadata={event => {
        const seconds = event.currentTarget.duration;
        if (Number.isFinite(seconds) && seconds > 0) { setDuration(seconds); setError(""); }
        else setError("The recording’s duration could not be read. Try a WAV or MP3 file.");
      }} onError={() => { setDuration(null); setReviewing(false); setError("Your browser could not play this recording. Try a WAV or MP3 file."); }} />
      <p className="studio-help">Original recording · {(sample.file.size / 1024 / 1024).toFixed(2)} MB{duration !== null && ` · ${duration.toFixed(1)} seconds`}</p>
    </div>}
    {error && <p className="studio-error" role="alert">{error}</p>}
    <p id="clone-local-note" className="clone-local-note">The recording stays in this tab and is not uploaded. This setup clears when you leave the cloning tab or refresh.</p>
  </section>;
}
