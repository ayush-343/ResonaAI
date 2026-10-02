"use client";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Heart, Loader2, Play, Square } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SAMPLES, VOICES, getVoice, type VoiceId } from "@/features/tts-engine/catalog";
import { useTTSEngine } from "@/features/tts-engine/use-tts-engine";
import { VoiceCloneSetup } from "./voice-clone-setup";

type Preview = { url: string; duration: number };
export function VoicesCatalog({ initialTab = "built-in" }: { initialTab?: "built-in" | "cloning" }) {
  const { orgId } = useAuth();
  const [language, setLanguage] = useState("all"), [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<VoiceId[]>([]), [onlyFavorites, setOnlyFavorites] = useState(false);
  const [notice, setNotice] = useState(""), [previewId, setPreviewId] = useState<VoiceId | null>(null), [preparing, setPreparing] = useState<VoiceId | null>(null);
  const previews = useRef(new Map<VoiceId, Preview>());
  const pending = useRef(false);
  const engine = useTTSEngine();
  const favoriteKey = `resona-favorite-voices-v1:${orgId ?? ""}`;
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const saved: unknown = JSON.parse(localStorage.getItem(favoriteKey) ?? "[]");
        setFavorites(Array.isArray(saved) ? saved.filter((id): id is VoiceId => typeof id === "string" && Boolean(getVoice(id))) : []);
      } catch { setFavorites([]); }
    });
    return () => { active = false; };
  }, [favoriteKey]);
  useEffect(() => {
    const cached = previews.current;
    return () => { for (const preview of cached.values()) URL.revokeObjectURL(preview.url); cached.clear(); };
  }, []);
  function favorite(id: VoiceId) {
    const next = favorites.includes(id) ? favorites.filter(item => item !== id) : [...favorites, id];
    setFavorites(next);
    try { localStorage.setItem(favoriteKey, JSON.stringify(next)); } catch { setNotice("Favorites could not be saved in this browser. Your selection lasts for this page visit."); }
  }
  async function preview(id: VoiceId) {
    if (pending.current) return;
    if (previews.current.has(id)) { setPreviewId(id); return; }
    pending.current = true; setPreparing(id); setNotice(""); setPreviewId(null);
    try {
      if (engine.state.status !== "ready") await engine.load("wasm");
      const voice = getVoice(id)!;
      const audio = await engine.generate({ text: voice.language === "en" ? SAMPLES.en : SAMPLES.hi, language: voice.language, voiceId: id, speed: 1 });
      previews.current.set(id, { url: URL.createObjectURL(new Blob([audio.wav], { type: "audio/wav" })), duration: audio.duration });
      setPreviewId(id);
    } catch (error) { if ((error as Error).name !== "AbortError") setNotice((error as Error).message); }
    finally { pending.current = false; setPreparing(null); }
  }
  const visible = VOICES.filter(voice => (language === "all" || voice.language === language) && (!onlyFavorites || favorites.includes(voice.id)) && `${voice.name} ${voice.accent} ${voice.description}`.toLowerCase().includes(query.trim().toLowerCase()));
  const selected = previewId ? previews.current.get(previewId) : null;
  return <Tabs defaultValue={initialTab} className="voices-workspace" onValueChange={value => { if (value === "cloning" && pending.current) engine.cancel(); }}>
    <TabsList variant="line" aria-label="Voice tools"><TabsTrigger value="built-in">Built-in voices</TabsTrigger><TabsTrigger value="cloning">Voice cloning</TabsTrigger></TabsList>
    <TabsContent value="built-in"><div className="voices-introduction"><h2 className="workspace-heading">Find your voice</h2><p className="workspace-description">Choose a voice for your next script. Preview the same passage to compare voices.</p></div>
      <div className="voice-toolbar"><div className="voice-search"><label htmlFor="voice-search" className="sr-only">Search voices</label><input id="voice-search" type="search" placeholder="Search voices by name or accent…" value={query} onChange={event => setQuery(event.target.value)} /></div><div className="language-options" role="group" aria-label="Voice language">{[{ id: "all", title: "All" }, { id: "en", title: "English" }, { id: "hi", title: "Hindi & Hinglish" }].map(item => <button key={item.id} aria-pressed={language === item.id} onClick={() => setLanguage(item.id)}>{item.title}</button>)}<button aria-pressed={onlyFavorites} onClick={() => setOnlyFavorites(value => !value)}>Favorites</button></div></div>
      <p className="studio-help voice-preview-help">Previews run locally with the CPU model (~93 MB plus pronunciation/runtime files on first use). Hindi and Hinglish remain experimental. Press play after a preview is prepared.</p>
      {preparing && <div className="voice-preview-status" role="status"><Loader2 aria-hidden="true" className="motion-safe:animate-spin" size={16} /><span>{getVoice(preparing)?.name}: {engine.state.message}</span><Button variant="ghost" size="sm" onClick={engine.cancel}><Square aria-hidden="true" />Cancel</Button></div>}
      {notice && <p role="status" className="history-notice">{notice}</p>}
      <ul className="voice-list">{visible.map(voice => <li key={voice.id} className={`voice-row${previewId === voice.id ? " voice-row-selected" : ""}`}><span className="voice-initial" aria-hidden="true">{voice.name.slice(0, 1)}</span><div className="voice-row-description"><h3>{voice.name}</h3><p className="voice-accent">{voice.accent}</p><p className="voice-description">{voice.description}</p>{previewId === voice.id && selected && <div className="voice-preview-player"><audio controls preload="metadata" src={selected.url} aria-label={`${voice.name} voice preview`} className="studio-audio" /><span className="studio-help">{selected.duration.toFixed(1)} seconds · Generated on this device</span></div>}</div><div className="voice-row-actions"><Button variant="ghost" size="icon" aria-label={`${favorites.includes(voice.id) ? "Unfavorite" : "Favorite"} ${voice.name}`} aria-pressed={favorites.includes(voice.id)} onClick={() => favorite(voice.id)}><Heart aria-hidden="true" fill={favorites.includes(voice.id) ? "currentColor" : "none"} /></Button><Button variant="outline" size="sm" disabled={Boolean(preparing)} aria-label={`Preview ${voice.name} voice`} onClick={() => void preview(voice.id)}><Play aria-hidden="true" />Preview</Button><Button size="sm" asChild><Link href={`/text-to-speech?voice=${voice.id}`} aria-label={`Use ${voice.name} voice`}>Use voice</Link></Button></div></li>)}</ul>
      {!visible.length && <div className="history-empty"><p>No voices match your selection.</p><Button variant="outline" onClick={() => { setQuery(""); setLanguage("all"); setOnlyFavorites(false); }}>Reset filters</Button></div>}
    </TabsContent>
    <TabsContent value="cloning"><VoiceCloneSetup /></TabsContent>
  </Tabs>;
}
