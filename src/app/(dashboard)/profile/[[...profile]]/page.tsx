import { redirect } from "next/navigation";
import { PROFILE_PATH } from "@/features/dashboard/data/navigation";
export default async function ProfileRedirect({ params }: { params: Promise<{ profile?: string[] }> }) { const { profile = [] } = await params; redirect(PROFILE_PATH + (profile.length ? `/${profile.map(encodeURIComponent).join("/")}` : "")); }
