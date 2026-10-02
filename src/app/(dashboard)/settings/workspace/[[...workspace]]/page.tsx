import { OrganizationProfile } from "@clerk/nextjs";
import { WORKSPACE_PATH } from "@/features/dashboard/data/navigation";
export const metadata = { title: "Workspace settings" };
export default function WorkspaceSettingsPage() {
  return <section aria-labelledby="workspace-heading"><h2 id="workspace-heading" className="workspace-heading">Workspace</h2><p className="workspace-description">Manage this workspace’s name, members and invitations. Available actions depend on your role.</p><div className="clerk-settings"><OrganizationProfile routing="path" path={WORKSPACE_PATH} afterLeaveOrganizationUrl="/org-selection" fallback={<p role="status">Loading your workspace…</p>} appearance={{ elements: { rootBox: "w-full! max-w-full! min-w-0!", cardBox: "w-full! max-w-full! min-w-0! shadow-none! border border-border", pageScrollBox: "min-w-0!", page: "min-w-0!" } }} /></div></section>;
}
