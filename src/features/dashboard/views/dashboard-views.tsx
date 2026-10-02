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
                <TextInputPanel />
                <QuickActionsPanel />
                {orgId && <HistoryPanel key={orgId} owner={orgId} revision="home" lab={false} limit={3} compact title="Recent outputs" />}
            </div>
        </div>
    )
}
