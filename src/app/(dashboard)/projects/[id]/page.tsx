import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { ProjectEditor } from "@/features/projects/project-editor";
import { ownerKey } from "@/features/projects/model";
export const metadata = { title: "Project Studio" };
export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId, orgId } = await auth();
  if (!userId) redirect("/sign-in");
  if (!orgId) redirect("/org-selection");
  const { id } = await params, owner = ownerKey(userId, orgId);
  return <><PageHeader title="Project Studio" badge="Beta" /><ProjectEditor key={`${owner}:${id}`} owner={owner} orgId={orgId} id={id} /></>;
}
