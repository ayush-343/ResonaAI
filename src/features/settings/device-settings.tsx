"use client";
import { useCallback, useEffect, useState } from "react";
import { Cpu, HardDrive, Monitor, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listLocalRecords } from "@/features/history/local-store";
import type { Backend } from "@/features/tts-engine/catalog";
import { readBackendPreference, writeBackendPreference } from "@/features/tts-engine/device-preferences";
import { inspectSpeechCache, removeSpeechCache } from "./device-storage";

type Details = { gpu: boolean; assets: number | null; models: string[]; usage: number | null; quota: number | null; recordings: number | null; audioBytes: number | null };
const bytes = (value: number | null) => value === null ? "Unavailable" : value >= 1024 ** 3 ? `${(value / 1024 ** 3).toFixed(2)} GB` : `${(value / 1024 ** 2).toFixed(1)} MB`;
export function DeviceSettings({ owner }: { owner: string }) {
  const [backend, setBackend] = useState<Backend>("webgpu");
  const [details, setDetails] = useState<Details | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const refresh = useCallback(async () => {
    const [cache, estimate, records] = await Promise.allSettled([
      inspectSpeechCache(), navigator.storage?.estimate() ?? Promise.resolve({ usage: undefined, quota: undefined }), listLocalRecords(owner),
    ]);
    setDetails({ gpu: "gpu" in navigator, assets: cache.status === "fulfilled" ? cache.value.assets : null, models: cache.status === "fulfilled" ? cache.value.models : [], usage: estimate.status === "fulfilled" ? estimate.value.usage ?? null : null, quota: estimate.status === "fulfilled" ? estimate.value.quota ?? null : null, recordings: records.status === "fulfilled" ? records.value.length : null, audioBytes: records.status === "fulfilled" ? records.value.reduce((total, record) => total + record.blob.size, 0) : null });
  }, [owner]);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => { if (!active) return; try { setBackend(readBackendPreference(localStorage) ?? "webgpu"); } catch { /* Defaults work without storage. */ } void refresh(); });
    return () => { active = false; };
  }, [refresh]);
  async function clearModels() {
    if (!window.confirm("Remove this browser’s downloaded speech model and pronunciation files? Audio recordings will be kept. The next model load will need a download.")) return;
    setBusy(true); setNotice("");
    try { await removeSpeechCache(); await refresh(); setNotice("Downloaded speech assets removed. Close any open Studio or voice-preview tab to release its loaded model."); }
    catch { setNotice("Some model files could not be removed. Close other tabs and try again."); }
    finally { setBusy(false); }
  }
  return <section className="device-settings" aria-labelledby="device-heading">
    <h2 id="device-heading" className="workspace-heading">Device & Storage</h2><p className="workspace-description">Manage how speech runs on this browser. These preferences stay on this device.</p>
    <section className="settings-section" aria-labelledby="device-model-heading"><div className="settings-section-heading"><Cpu aria-hidden="true" /><div><h3 id="device-model-heading">Speech model</h3><p>Kokoro · built-in English and experimental Hindi voices</p></div></div><dl className="settings-facts"><div><dt>Downloaded assets</dt><dd>{details ? details.assets === null ? "Cache unavailable" : `${details.assets} cached files` : "Checking…"}</dd></div><div><dt>Cached model files</dt><dd>{details ? details.models.length ? details.models.join(" and ") : "No model file found" : "Checking…"}</dd></div><div><dt>Initial model download</dt><dd>GPU: ~326 MB · CPU: ~93 MB</dd></div></dl><p className="studio-help">Pronunciation and runtime files are additional. A cached file does not mean the engine is currently loaded.</p><Button variant="outline" disabled={busy || !details?.assets} onClick={() => void clearModels()}>Remove downloaded models</Button></section>
    <section className="settings-section" aria-labelledby="processing-heading"><div className="settings-section-heading"><Monitor aria-hidden="true" /><div><h3 id="processing-heading">Processing</h3><p>Choose the default for your next Studio session.</p></div></div><fieldset className="processing-options"><legend className="sr-only">Preferred processing</legend>{([{ value: "webgpu", title: "GPU", description: "Use WebGPU on compatible laptops." }, { value: "wasm", title: "CPU", description: "Use the smaller model through WebAssembly." }] as const).map(option => <label key={option.value}><input type="radio" name="processing" value={option.value} checked={backend === option.value} onChange={() => { setBackend(option.value); try { if (!writeBackendPreference(localStorage, option.value)) setNotice("This browser could not save the preference. You can still choose processing in Studio."); else setNotice("Processing preference saved on this device."); } catch { setNotice("Browser storage is unavailable. Choose processing in Studio instead."); } }} /><span><strong>{option.title}</strong><span>{option.description}</span></span></label>)}</fieldset><p className="studio-help">{details ? details.gpu ? "The WebGPU browser API is available. Hardware compatibility is checked when loading the model." : "WebGPU is not available in this browser. Choose CPU to generate speech." : "Checking browser capabilities…"} Studio allows switching manually if GPU loading fails.</p></section>
    <section className="settings-section" aria-labelledby="storage-heading"><div className="settings-section-heading"><HardDrive aria-hidden="true" /><div><h3 id="storage-heading">Storage</h3><p>Actual browser usage and this workspace’s local recordings.</p></div></div><dl className="settings-facts"><div><dt>Local recordings in this workspace</dt><dd>{details ? details.recordings ?? "Unavailable" : "Checking…"}</dd></div><div><dt>Workspace audio size</dt><dd>{details ? bytes(details.audioBytes) : "Checking…"}</dd></div><div><dt>Storage used by this site</dt><dd>{details ? bytes(details.usage) : "Checking…"}</dd></div><div><dt>Estimated browser quota</dt><dd>{details ? bytes(details.quota) : "Checking…"}</dd></div></dl><p className="studio-help">Site usage includes model caches and all workspaces in this browser. Manage individual recordings in History. Quota and usage are browser estimates.</p><Button variant="outline" disabled={busy} onClick={() => { setBusy(true); void refresh().finally(() => setBusy(false)); }}><RefreshCw aria-hidden="true" />Refresh device details</Button></section>
    {notice && <p className="history-notice" role="status">{notice}</p>}
  </section>;
}
