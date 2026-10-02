import { redirect } from "next/navigation";
import { PROFILE_PATH } from "@/features/dashboard/data/navigation";
export default function SettingsPage() { redirect(PROFILE_PATH); }
