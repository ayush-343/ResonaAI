import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { TextInputPanel } from "@/features/dashboard/components/text-input-panel";
import { QuickActionsPanel } from "../components/quick-action-panel";
import { auth } from "@clerk/nextjs/server";
import { HistoryPanel } from "@/features/history/history-panel";

export async function DashboardView() {
    const { orgId } = await auth();
    return (
        <div className="relative">
            <PageHeader title="Home" />
            <div className="workspace-page home-page">
                <DashboardHeader />
                <section className="home-projects" aria-labelledby="home-projects-heading">
                    <div><h3 id="home-projects-heading">Creator Studio <span className="workspace-beta">Beta</span></h3><p>Build chapters with multiple speakers, or import TXT, DOCX and selectable-text PDFs. Listen with bookmarks, resume where you left off, and export WAV audio.</p><small>Editable projects and generated sections stay in this browser.</small></div>
                    <Link href="/projects">Open Projects <ArrowRight size={16} aria-hidden="true" /></Link>
                </section>
                <TextInputPanel />
                <QuickActionsPanel />
                {orgId && <HistoryPanel key={orgId} owner={orgId} revision="home" lab={false} limit={3} compact title="Recent outputs" />}
            </div>
        </div>
    )
}
