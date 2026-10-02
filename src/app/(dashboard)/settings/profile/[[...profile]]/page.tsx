import { UserProfile } from "@clerk/nextjs";
import { PROFILE_PATH } from "@/features/dashboard/data/navigation";
export const metadata = { title: "Profile settings" };
export default function ProfileSettingsPage() {
  return <section aria-labelledby="profile-heading"><h2 id="profile-heading" className="workspace-heading">Profile</h2><p className="workspace-description">Manage your personal details, sign-in methods and account security.</p><div className="clerk-settings"><UserProfile routing="path" path={PROFILE_PATH} fallback={<p role="status">Loading your profile…</p>} appearance={{ elements: { rootBox: "w-full! max-w-full! min-w-0!", cardBox: "w-full! max-w-full! min-w-0! shadow-none! border border-border", pageScrollBox: "min-w-0!", page: "min-w-0!" } }} /></div></section>;
}
