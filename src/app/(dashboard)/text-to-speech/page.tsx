import type { Metadata } from "next";
import { TextToSpeechView } from "@/features/text-to-speech/views/text-to-speech-view";

//
export const metadata: Metadata = {
    title: "Text to Speech",
    description: "Convert your text into natural-sounding speech with our Text to Speech feature. Perfect for creating voiceovers, audiobooks, and more.",
};

export default function TextToSpeechPage() {
    return (
        <TextToSpeechView />
    )
}