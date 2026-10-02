"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Backend } from "./catalog";
import type { GenerateInput, WorkerEvent, WorkerRequest } from "./protocol";

export type EngineState = { status: "idle" | "loading" | "ready" | "generating" | "error"; message: string; progress: number | null; backend: Backend | null; loadMs: number | null };
export type EngineResult = Extract<WorkerEvent, { type: "result" }>;
const initialState: EngineState = { status: "idle", message: "The model has not been loaded.", progress: null, backend: null, loadMs: null };

export function useTTSEngine() {
  const [state, setState] = useState<EngineState>(initialState);
  const worker = useRef<Worker | null>(null);
  const pending = useRef<{ id: string; resolve: (value: WorkerEvent) => void; reject: (error: Error) => void } | null>(null);
  const terminate = useCallback(() => {
    worker.current?.terminate(); worker.current = null;
    pending.current?.reject(new DOMException("Generation cancelled.", "AbortError")); pending.current = null;
  }, []);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setState(initialState));
    return () => { cancelAnimationFrame(frame); terminate(); };
  }, [terminate]);

  const request = useCallback((message: WorkerRequest) => new Promise<WorkerEvent>((resolve, reject) => {
    if (pending.current) { reject(new Error("Wait for the current operation to finish.")); return; }
    if (!worker.current) {
      worker.current = new Worker(new URL("./tts.worker.ts", import.meta.url), { type: "module" });
      worker.current.onmessage = (event: MessageEvent<WorkerEvent>) => {
        const message = event.data;
        if (message.id !== pending.current?.id) return;
        if (message.type === "progress") setState(value => ({ ...value, message: message.message, progress: message.progress ?? null }));
        if (message.type === "chunk") setState(value => ({ ...value, message: `Generating section ${message.done} of ${message.total}`, progress: message.done / message.total * 100 }));
        if (message.type === "ready") setState({ status: "ready", message: "Ready to generate on this device.", progress: null, backend: message.backend, loadMs: message.loadMs });
        if (message.type === "result") setState(value => ({ ...value, status: "ready", message: "Speech generated on this device.", progress: null }));
        if (message.type === "error") {
          setState(value => ({ ...value, status: "error", message: message.message, progress: null }));
          pending.current?.reject(new Error(message.message)); pending.current = null;
        } else if (message.type === "ready" || message.type === "result") { pending.current?.resolve(message); pending.current = null; }
      };
      worker.current.onerror = () => {
        const error = new Error("The speech worker stopped. Reload the model or select CPU mode.");
        setState(value => ({ ...value, status: "error", message: error.message, progress: null }));
        pending.current?.reject(error); pending.current = null; worker.current?.terminate(); worker.current = null;
      };
    }
    pending.current = { id: message.id, resolve, reject };
    worker.current.postMessage(message);
  }), []);

  const load = useCallback(async (backend: Backend) => {
    setState(value => ({ ...value, status: "loading", message: "Connecting to the model…", progress: null }));
    await request({ id: crypto.randomUUID(), type: "load", backend });
  }, [request]);
  const generate = useCallback(async (input: GenerateInput) => {
    setState(value => ({ ...value, status: "generating", message: "Preparing your script…", progress: 0 }));
    return await request({ id: crypto.randomUUID(), type: "generate", input }) as EngineResult;
  }, [request]);
  const cancel = useCallback(() => { terminate(); setState({ ...initialState, message: "Cancelled. Reload the cached model to continue." }); }, [terminate]);
  return { state, load, generate, cancel };
}
