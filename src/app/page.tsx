import type { Metadata } from "next";
import { LandingPage } from "@/features/landing/landing-page";
import "@/features/landing/landing.css";
export const metadata: Metadata = { title: "ResonaAI — Give your words a voice", description: "Create voiceovers, multi-speaker projects and document narration on your laptop. Creator Studio Beta includes chapters, bookmarks and WAV exports." };
export default function Page() { return <LandingPage />; }
