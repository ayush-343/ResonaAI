import Link from "next/link";
import { ArrowRight, AudioLines, Library } from "lucide-react";

export function QuickActionsPanel() {
    return <nav className="home-shortcuts" aria-label="Speech shortcuts"><Link href="/text-to-speech"><AudioLines aria-hidden="true" /><div><strong>Open Speech Studio</strong><span>Write, listen and download a voiceover.</span></div><ArrowRight aria-hidden="true" /></Link><Link href="/voices"><Library aria-hidden="true" /><div><strong>Find your voice</strong><span>Explore built-in voices and cloning setup.</span></div><ArrowRight aria-hidden="true" /></Link></nav>;
};
