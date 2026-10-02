import type { Metadata } from "next";
import { TextToSpeechView } from "@/features/text-to-speech/views/text-to-speech-view";

//
export const metadata: Metadata = {
    title: "Speech Studio",
    description: "Convert your text into natural-sounding speech with our Text to Speech feature. Perfect for creating voiceovers, audiobooks, and more.",
};

export default async function TextToSpeechPage({ searchParams }: { searchParams: Promise<{ text?: string; voice?: string; draft?: string; language?: string }> }) {
    const params = await searchParams;
    return (
        <TextToSpeechView initialLanguage={typeof params.language === "string" ? params.language : undefined} draftId={typeof params.draft === "string" ? params.draft.slice(0, 128) : undefined} initialText={typeof params.text === "string" ? params.text.slice(0, 5000) : ""} initialVoice={typeof params.voice === "string" ? params.voice : undefined} />
    )
}
