import Link from "next/link";
import { SpeechStudio } from "@/features/text-to-speech/components/speech-studio";
export const metadata = { title: "Local speech benchmark", robots: { index: false, follow: false } };
export default function LabPage() {
  return <main className="lab-page"><header className="lab-header"><div><h1>Local speech benchmark</h1><p>Test English, Hindi and Hinglish on this laptop. Results stay on this device.</p></div><Link href="/text-to-speech">Open your workspace</Link></header><SpeechStudio owner="local-lab" lab /></main>;
}
