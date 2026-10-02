import { redirect } from "next/navigation";
import { PROFILE_PATH } from "@/features/dashboard/data/navigation";
export default async function AccountRedirect({ params }: { params: Promise<{ account?: string[] }> }) { const { account = [] } = await params; redirect(PROFILE_PATH + (account.length ? `/${account.map(encodeURIComponent).join("/")}` : "")); }
