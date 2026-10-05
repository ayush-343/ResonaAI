"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { PROJECT_TEXT_LIMIT, textCount, type Project } from "./model";
import { getProject, saveProject } from "./store";
export function useProject(owner: string, id: string) {
  const [project, setProject] = useState<Project | null>(null);
  const current = useRef<Project | null>(null);
  const [status, setStatus] = useState("Loading project…");
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const dirty = useRef(false), alive = useRef(true);
  const serial = useRef<Promise<void>>(Promise.resolve());
  const flush = useCallback(() => {
    const write = async () => {
      const snapshot = current.current;
      if (!snapshot || !dirty.current) return;
      try {
        const saved = await saveProject(snapshot);
        if (current.current === snapshot) { current.current = saved; dirty.current = false; }
        else if (current.current) current.current = { ...current.current, revision: saved.revision };
        if (alive.current) { setProject(current.current); setStatus(dirty.current ? "Saving…" : "Saved on this device"); setError(""); }
      } catch (error) {
        if (alive.current) { setStatus("Not saved"); setError((error as Error).message); }
        throw error;
      }
    };
    serial.current = serial.current.catch(() => {}).then(write);
    return serial.current;
  }, []);
  useEffect(() => {
    alive.current = true;
    let cancelled = false;
    void getProject(owner, id).then(value => {
      if (cancelled) return;
      current.current = value ?? null; setProject(value ?? null); setLoaded(true);
      setStatus(value ? "Saved on this device" : "Project not found on this device.");
    }).catch(error => { if (!cancelled) { setError(error.message); setLoaded(true); } });
    const beforeUnload = (event: BeforeUnloadEvent) => { if (dirty.current) { event.preventDefault(); event.returnValue = ""; } };
    const hidden = () => { if (document.visibilityState === "hidden") void flush().catch(() => {}); };
    window.addEventListener("beforeunload", beforeUnload); document.addEventListener("visibilitychange", hidden);
    return () => { cancelled = true; alive.current = false; window.removeEventListener("beforeunload", beforeUnload); document.removeEventListener("visibilitychange", hidden); void flush().catch(() => {}); };
  }, [owner, id, flush]);
  const update = useCallback((change: (project: Project) => Project) => {
    if (!current.current) return;
    const next = change(current.current);
    if (textCount(next) > PROJECT_TEXT_LIMIT) { setError("Projects support up to 100,000 characters, including pronunciation overrides. Split this into another project."); return; }
    current.current = next; dirty.current = true; setProject(next); setStatus("Saving…");
    // Start the transaction immediately, serialize writes, and save any newer snapshot next.
    void flush().catch(() => {});
  }, [flush]);
  return { project, current, update, flush, loaded, status, error };
}
