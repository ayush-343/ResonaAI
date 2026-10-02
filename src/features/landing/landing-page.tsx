"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, ChevronDown, Download, Folder, Headphones, Home, Laptop, Mic, Settings, User, History } from "lucide-react";
import { SAMPLES, TEXT_LIMIT, voicesFor, type LanguageMode } from "@/features/tts-engine/catalog";
const LANGUAGES = [{ id: "en", label: "English" }, { id: "hi", label: "Hindi" }, { id: "hinglish", label: "Hinglish" }] as const;
const FAQ = [
  ["Does speech generation run locally?", "Yes. The speech model runs in your browser using WebGPU, or a CPU option with WebAssembly. Accounts and workspace history use cloud services. Text and audio are uploaded when you choose Save to workspace."],
  ["What do I need to download?", "The first generation needs model files: approximately 326 MB for WebGPU or 93 MB for CPU, plus pronunciation and runtime files. A network connection is needed to download them. Cached files can be reused; browser storage may be cleared by your browser."],
  ["Can I use Hindi and Hinglish?", "Hindi and mixed-script Hinglish are experimental. Listen carefully and check pronunciation before publishing. For Romanized Hindi, use the pronunciation override in Studio to supply Devanagari text."],
  ["Can I clone my voice?", "You can explore the voice-cloning setup and review a recording locally. The cloning engine is not available yet, and this setup does not create a usable cloned voice."],
  ["Which devices work best?", "Start with a laptop and a browser with WebGPU support. Compatibility and generation speed depend on your hardware. If GPU loading fails, choose CPU in Studio. Mobile performance has not been validated."],
] as const;
export function LandingPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<LanguageMode>("en");
  const [text, setText] = useState("Some stories are better heard. Give this one a voice.");
  const [voice, setVoice] = useState("af_heart");
  const choices = voicesFor(language);
  function openStudio() {
    // Public handoff survives sign-in and workspace selection; no text in a URL.
    try {
      sessionStorage.setItem("resona-script-draft", text);
      router.push(`/text-to-speech?draft=${crypto.randomUUID()}&voice=${voice}&language=${language}`);
    } catch { router.push(`/text-to-speech?text=${encodeURIComponent(text)}&voice=${voice}&language=${language}`); }
  }
  return <div className="resona-landing">
    <a className="landing-skip" href="#main">Skip to content</a>
    <header className="landing-nav landing-width"><Link href="/" className="landing-brand" aria-label="ResonaAI home"><Image src="/logo.svg" width={28} height={26} alt="" />ResonaAI</Link><nav aria-label="Main navigation"><a href="#voices">Voices</a><a href="#how-it-works">How it works</a><a href="#faq">FAQ</a></nav><div className="landing-nav-actions"><Link href="/sign-in">Log in</Link><Link className="landing-button" href="/home">Open Studio <ArrowRight size={16} /></Link></div></header>
    <main id="main">
      <section className="landing-hero landing-width"><h1>Give your words<br />a voice.</h1><div><p>Create speech on your laptop. Start with English voices and explore experimental Hindi and Hinglish.</p><Link className="landing-button" href="/text-to-speech">Open Speech Studio <ArrowRight size={18} /></Link></div></section>
      <section className="landing-demo landing-width" id="voices" aria-label="Explore built-in voices">
        <div className="landing-demo-controls"><div className="landing-demo-top"><div className="landing-pills" role="group" aria-label="Script language">{LANGUAGES.map(item => <button key={item.id} aria-pressed={language === item.id} onClick={() => { setLanguage(item.id); setVoice(item.id === "en" ? "af_heart" : "hf_alpha"); setText(SAMPLES[item.id]); }}>{item.label}</button>)}</div><p>Hindi and Hinglish are experimental.</p></div>
          <label className="landing-sr-only" htmlFor="landing-script">Your sample script</label><textarea id="landing-script" value={text} onChange={event => setText(event.target.value)} maxLength={TEXT_LIMIT} /><div className="landing-count">{text.length} / {TEXT_LIMIT.toLocaleString()} characters</div>
          <div className="landing-voice-picker"><label htmlFor="landing-voice">Voice</label><select id="landing-voice" value={voice} onChange={event => setVoice(event.target.value)}>{choices.map(item => <option key={item.id} value={item.id}>{item.name} · {item.language === "en" ? "English" : "Hindi"}</option>)}</select></div>
          <button className="landing-button" disabled={!text.trim()} onClick={openStudio}>Try in Studio <ArrowRight size={17} /></button><p className="landing-download-note">Sign in, then download the model to generate speech.</p>
          <div className="landing-sample-voices" aria-label="Choose a sample voice">{choices.slice(0,3).map(item => <button key={item.id} aria-pressed={voice === item.id} onClick={() => setVoice(item.id)}><span className="landing-voice-initial">{item.name[0]}</span><span>{item.name}<small>{item.language === "en" ? "English" : "Hindi · experimental"}</small></span></button>)}</div>
        </div><div className="landing-art" aria-hidden="true"><Image src="/images/voice-ribbon.png" width={1536} height={1024} sizes="(max-width: 700px) 225px, 45vw" alt="" priority /></div>
      </section>
      <section className="landing-product landing-width" aria-labelledby="product-heading"><div className="landing-section-heading"><h2 id="product-heading">From a first draft<br />to the final listen.</h2><p>A focused workspace for your words. Pick a voice, check pronunciation, and listen to what you create.</p></div>
        <div className="landing-preview" aria-label="Illustrative Speech Studio preview"><aside><span className="landing-brand">ResonaAI</span>{[[Home,"Home"],[Headphones,"Speech Studio"],[User,"Voices"],[History,"History"],[Settings,"Settings"]].map(([Icon,label]) => { const Component = Icon as typeof Home; return <div key={label as string} className={label === "Speech Studio" ? "preview-selected" : ""}><Component size={16} />{label as string}</div>; })}</aside><div className="preview-studio"><h3>Speech Studio</h3><p>Write your script. Choose a voice. Make it heard.</p><div className="preview-editor-grid"><div><div className="preview-script">Some stories are better heard.<br />Give this one a voice.</div><div className="preview-toolbar"><span>Heart · English</span><span>Kokoro-82M</span></div></div><div className="preview-inspector"><strong>Processing</strong><span>WebGPU · on your device</span><strong>Pronunciation</strong><span>Use the words that sound right.</span><span className="preview-download"><Download size={15} /> Download & load model</span></div></div><Link href="/text-to-speech" className="preview-open">Open the real Studio <ArrowRight size={16} /></Link></div></div>
      </section>
      <section className="landing-steps landing-width" id="how-it-works" aria-label="How it works"><article><User size={24} /><h3>Choose a voice</h3><p>Explore built-in English voices, with experimental Hindi and Hinglish options.</p></article><article><Laptop size={24} /><h3>Generate on your device</h3><p>Download the model once to get started. Speech inference runs locally on your laptop.</p></article><article><Folder size={24} /><h3>Save when you choose</h3><p>Download your audio, keep device history, or explicitly save it to your cloud workspace.</p></article></section>
      <section className="landing-cloning landing-width"><div><h2>Your voice, next.</h2><p>Explore a recording setup for future voice cloning.<br />The cloning engine is not available yet.</p></div><div className="landing-clone-status"><Mic size={28} /><span>Setup preview</span></div><Link href="/voices?tab=cloning">Prepare a sample <ArrowRight size={17} /></Link></section>
      <section className="landing-faq landing-width" id="faq"><h2>Frequently asked questions</h2>{FAQ.map(([question,answer]) => <details key={question}><summary>{question}<ChevronDown size={18} /></summary><p>{answer}</p></details>)}</section>
    </main><footer className="landing-footer landing-width"><Link href="/" className="landing-brand">ResonaAI</Link><nav aria-label="Footer navigation"><a href="#voices">Voices</a><a href="#how-it-works">How it works</a><a href="#faq">FAQ</a></nav><Link className="landing-button" href="/home">Open Studio <ArrowRight size={16} /></Link></footer>
  </div>;
}
