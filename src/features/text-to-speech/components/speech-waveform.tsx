"use client";
import { useEffect, useState } from "react";
import "./speech-waveform.css";

export function SpeechWaveform({ blob }: { blob: Blob }) {
  const [peaks, setPeaks] = useState<number[]>([]);
  useEffect(() => {
    let active = true;
    void blob.arrayBuffer().then(buffer => {
      const view = new DataView(buffer);
      if (buffer.byteLength < 44 || view.getUint16(20, true) !== 1 || view.getUint16(22, true) !== 1 || view.getUint16(34, true) !== 16) return;
      const count = Math.floor((buffer.byteLength - 44) / 2);
      const next = Array.from({ length: 80 }, (_, bucket) => {
        let peak = 0;
        for (let i = Math.floor(bucket * count / 80); i < Math.floor((bucket + 1) * count / 80); i++) peak = Math.max(peak, Math.abs(view.getInt16(44 + i * 2, true)) / 32768);
        return peak;
      });
      if (active) setPeaks(next);
    }).catch(() => { /* Native playback remains available without a waveform. */ });
    return () => { active = false; };
  }, [blob]);
  if (!peaks.length) return null;
  return <svg className="speech-waveform" viewBox="0 0 400 56" role="img" aria-label="Amplitude waveform of the generated recording">{peaks.map((peak, i) => <line key={i} x1={i * 5 + 2} x2={i * 5 + 2} y1={28 - Math.max(1, peak * 26)} y2={28 + Math.max(1, peak * 26)} />)}</svg>;
}
