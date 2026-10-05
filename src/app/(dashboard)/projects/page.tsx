import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { ProjectLibrary } from "@/features/projects/project-library";
import { ownerKey } from "@/features/projects/model";
export const metadata = { title: "Projects" };
export default async function ProjectsPage() {
  const { userId, orgId } = await auth();
  if (!userId) redirect("/sign-in");
  if (!orgId) redirect("/org-selection");
  const owner = ownerKey(userId, orgId);
  return <><PageHeader title="Projects" badge="Beta" /><ProjectLibrary key={owner} owner={owner} /></>;
}
