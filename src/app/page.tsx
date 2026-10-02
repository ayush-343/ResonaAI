import type { Metadata } from "next";
import { LandingPage } from "@/features/landing/landing-page";
import "@/features/landing/landing.css";
export const metadata: Metadata = { title: "ResonaAI — Give your words a voice", description: "Create speech on your laptop with built-in English voices and experimental Hindi and Hinglish. Local inference, optional cloud workspace history." };
export default function Page() { return <LandingPage />; }
