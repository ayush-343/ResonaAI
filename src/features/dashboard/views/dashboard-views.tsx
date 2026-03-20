import { PageHeader } from "@/components/page-header";
import { HeroPattern } from "@/features/dashboard/components/hero-pattern";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { TextInputPanel } from "@/features/dashboard/components/text-input-panel";
import { QuickActionsPanel } from "../components/quick-action-panel";

export function DashboardView() {
    return (
        <div className="relative">
            <PageHeader title="Dashboard" className="lg:hidden" />
            <HeroPattern />
            <div className="relative space-y-8 p-4 lg:p-16">
                <DashboardHeader />
                <TextInputPanel />
                <QuickActionsPanel />

            </div>
        </div>
    )
}