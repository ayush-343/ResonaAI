"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AudioLines, ChevronDown, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listLocalRecords, putLocalRecord, deleteLocalRecord } from "./local-store";
import { listCloudRecords, saveToCloud, deleteCloudRecord } from "./cloud-client";
import type { CloudRecord, SpeechRecord } from "./types";
import { VOICES } from "@/features/tts-engine/catalog";

function LocalAudio({ record }: { record: SpeechRecord }) {
  const [url, setUrl] = useState("");
  useEffect(() => { const next = URL.createObjectURL(record.blob); const frame = requestAnimationFrame(() => setUrl(next)); return () => { cancelAnimationFrame(frame); URL.revokeObjectURL(next); }; }, [record.blob]);
  return <><audio controls preload="none" src={url || undefined} aria-label={`Saved ${record.voiceName} speech`} className="studio-audio" /><a href={url} download={`resona-${record.id}.wav`} className="history-download">Download WAV</a></>;
}

type HistoryItem = { record: SpeechRecord; local: true } | { record: CloudRecord; local: false };
export function HistoryPanel({ owner, revision, lab, limit = 10, compact = false, title = "Recent speech" }: { owner: string; revision: string; lab: boolean; limit?: number | null; compact?: boolean; title?: string }) {
  const [local, setLocal] = useState<SpeechRecord[]>([]), [cloud, setCloud] = useState<CloudRecord[]>([]);
  const [message, setMessage] = useState(""), [busy, setBusy] = useState(false), [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0), [query, setQuery] = useState(""), [location, setLocation] = useState("all");
  useEffect(() => {
    let active = true;
    const localRequest = listLocalRecords(owner).then(records => { if (active) setLocal(records); }).catch(error => { if (active) setMessage(error.message); });
    const cloudRequest = lab ? Promise.resolve() : listCloudRecords().then(response => { if (active) { setCloud(response.generations); if (!response.configured) setMessage("Cloud storage is not configured. Local results remain available."); } }).catch(error => { if (active) setMessage(error.message); });
    void Promise.all([localRequest, cloudRequest]).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [owner, revision, lab, refresh]);
  async function act(work: () => Promise<void>) { setBusy(true); setMessage(""); try { await work(); setRefresh(value => value + 1); } catch(error) { setMessage((error as Error).message); } finally { setBusy(false); } }
  const items: HistoryItem[] = [
    ...local.map(record => ({ record, local: true as const })),
    ...cloud.filter(record => !local.some(item => item.id === record.id)).map(record => ({ record, local: false as const })),
  ].sort((a, b) => b.record.createdAt.localeCompare(a.record.createdAt));
  const filtered = items.filter(item => {
    const saved = !item.local || item.record.saved;
    return (location === "all" || (location === "device" && item.local) || (location === "cloud" && saved)) && `${item.record.text} ${item.record.voiceName} ${item.record.language}`.toLocaleLowerCase().includes(query.toLocaleLowerCase().trim());
  });
  const visible = limit === null ? filtered : filtered.slice(0, limit);
  return <section id="speech-history" className={`studio-output history-panel${compact ? " history-compact" : ""}`} aria-labelledby="history-heading">
    <div className="history-heading-row"><h2 id="history-heading">{title}</h2>{limit !== null && !lab && <Link href="/history">View all <ArrowUpRight size={14} aria-hidden="true" /></Link>}</div>
    {!compact && <p className="studio-help">Local copies stay in this browser. Removing one keeps any saved workspace copy. Workspace history currently shows the latest 50 cloud results.</p>}
    {limit === null && <div className="history-filters"><div><label htmlFor="history-search">Search history</label><input id="history-search" type="search" placeholder="Search scripts or voices…" value={query} onChange={event => setQuery(event.target.value)} /></div><div><label htmlFor="history-location">Storage</label><select id="history-location" value={location} onChange={event => setLocation(event.target.value)}><option value="all">All results</option><option value="device">On this device</option><option value="cloud">Saved to workspace</option></select></div></div>}
    {message && <p role="status" className="history-notice">{message}</p>}
    {loading ? <p className="studio-help" role="status">Opening speech history…</p> : !visible.length && <div className="history-empty"><AudioLines aria-hidden="true" /><p>{items.length ? "No results match these filters." : "Your first recording starts with a script."}</p>{!items.length && <Link href="/text-to-speech">Open Speech Studio</Link>}</div>}
    {visible.map(item => {
      const record = item.record;
      const saved = !item.local || item.record.saved;
      const voiceId = item.local ? item.record.voiceId : VOICES.find(voice => voice.name === record.voiceName)?.id ?? (record.language === "en" ? "af_heart" : "hf_alpha");
      return <details key={record.id} className="history-record"><summary className="history-row"><span className="history-audio-icon"><AudioLines size={18} aria-hidden="true" /></span><span className="history-row-copy"><strong>{record.text}</strong><span>{record.voiceName} · {record.language === "en" ? "English" : record.language === "hi" ? "Hindi" : "Hinglish"} · {record.duration.toFixed(1)} s</span></span><span className="history-row-meta"><span className="storage-label">{saved ? "Workspace" : "On device"}</span><time dateTime={record.createdAt}>{new Date(record.createdAt).toLocaleDateString()}</time></span><ChevronDown size={16} aria-hidden="true" className="history-chevron" /></summary>
        <div className="history-detail"><p className="history-script">{record.text}</p>{item.local ? <LocalAudio record={item.record} /> : <audio controls preload="none" src={item.record.audioUrl} className="studio-audio" aria-label={`Workspace ${record.voiceName} speech`} />}
          <div className="output-actions"><Button variant="outline" asChild><Link href={`/text-to-speech?text=${encodeURIComponent(record.text)}&voice=${voiceId}&language=${record.language}`}>Reuse script</Link></Button>
            {item.local ? <>{!lab && !item.record.saved && <Button variant="outline" disabled={busy} onClick={() => void act(async () => { await saveToCloud(item.record); await putLocalRecord({ ...item.record, saved: true }); })}>Save to workspace</Button>}<Button variant="ghost" disabled={busy} onClick={() => { if (window.confirm("Remove this browser’s copy of this speech?")) void act(() => deleteLocalRecord(record.id)); }}>Remove local copy</Button></> : <Button variant="ghost" disabled={busy} onClick={() => { if (window.confirm("Permanently delete this workspace audio and its history?")) void act(() => deleteCloudRecord(record.id)); }}>Delete from workspace</Button>}
          </div>
        </div>
      </details>;
    })}
  </section>;
}
