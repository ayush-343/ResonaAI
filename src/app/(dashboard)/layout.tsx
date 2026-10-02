import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { DashboardSidebar } from "@/features/dashboard/components/dashboard-sidebar";
import "@/features/dashboard/workspace.css";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    const { userId, orgId } = await auth();
    if (!userId) redirect("/sign-in");
    if (!orgId) redirect("/org-selection");
    const cookieStore = await cookies();
    const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

    return (
        <SidebarProvider defaultOpen={defaultOpen} className="resona-workspace min-h-svh" style={{ "--sidebar-width": "14rem" } as React.CSSProperties}>
            <DashboardSidebar />
            <SidebarInset className="min-h-0 min-w-0">
                <main className="flex min-h-0 flex-1 flex-col">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    );
}
