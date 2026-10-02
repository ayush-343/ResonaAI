"use client";
import { useAuth } from "@clerk/nextjs";
import { SpeechStudio } from "../components/speech-studio";
export function TextToSpeechView({ initialText, initialVoice, initialLanguage, draftId }: { initialText?: string; initialVoice?: string; initialLanguage?: string; draftId?: string }) {
  const { orgId, isLoaded } = useAuth();
  if (!isLoaded || !orgId) return <div className="workspace-loading" role="status">Opening your workspace…</div>;
  return <SpeechStudio key={`${orgId}:${draftId ?? initialVoice ?? initialText ?? ""}:${initialLanguage ?? ""}`} owner={orgId} initialText={initialText} initialVoice={initialVoice} initialLanguage={initialLanguage} />;
}
