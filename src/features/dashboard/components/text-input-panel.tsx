"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SAMPLES, TEXT_LIMIT, type LanguageMode } from "@/features/tts-engine/catalog";
export function TextInputPanel() {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState<LanguageMode>("en");
  const router = useRouter();
  return <section className="studio-script home-compose"><div className="studio-section-header"><label htmlFor="quick-script" className="studio-title">Your script</label><div className="language-options" role="group" aria-label="Script language">{(["en", "hi", "hinglish"] as const).map(mode => <button key={mode} type="button" aria-pressed={language === mode} onClick={() => setLanguage(mode)}>{mode === "en" ? "English" : mode === "hi" ? "Hindi" : "Hinglish"}</button>)}</div></div><textarea id="quick-script" className="studio-textarea" placeholder={language === "en" ? "Write or paste the words you want to hear…" : "आज कुछ नया सीखते हैं। Write or paste your script…"} value={text} maxLength={TEXT_LIMIT} onChange={event => setText(event.target.value)} /><div className="studio-action-bar"><span className="tabular-nums">{text.length.toLocaleString()} / {TEXT_LIMIT.toLocaleString()} characters</span><div className="home-compose-actions"><Button variant="ghost" onClick={() => setText(SAMPLES[language])}>Try a sample</Button><Button disabled={!text.trim()} onClick={() => { const voice = language === "en" ? "af_heart" : "hf_alpha"; try { sessionStorage.setItem("resona-script-draft", text); router.push(`/text-to-speech?draft=${crypto.randomUUID()}&voice=${voice}&language=${language}`); } catch { router.push(`/text-to-speech?text=${encodeURIComponent(text)}&voice=${voice}&language=${language}`); } }}>Open in Studio</Button></div></div></section>;
}
