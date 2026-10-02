import { PageHeader } from "@/components/page-header";
import { VoicesCatalog } from "@/features/voices/voices-catalog";
export const metadata = { title: "Voices" };
export default async function VoicesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) { const initialTab = (await searchParams).tab === "cloning" ? "cloning" : "built-in"; return <><PageHeader title="Voices" /><div className="workspace-page"><VoicesCatalog initialTab={initialTab} /></div></>; }
