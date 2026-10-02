import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { HistoryPanel } from "@/features/history/history-panel";
export const metadata = { title: "History" };
export default async function HistoryPage() {
  const { orgId } = await auth();
  if (!orgId) redirect("/org-selection");
  return <><PageHeader title="History" /><div className="workspace-page"><p className="workspace-description">Listen, download and manage speech generated in this workspace.</p><HistoryPanel key={orgId} owner={orgId} revision="history-page" lab={false} limit={null} title="Your recordings" /></div></>;
}
