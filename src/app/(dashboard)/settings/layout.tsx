import { PageHeader } from "@/components/page-header";
import { SettingsNavigation } from "@/features/settings/settings-navigation";
export const metadata = { title: { default: "Settings", template: "%s | ResonaAI" } };
export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <><PageHeader title="Settings" /><div className="workspace-page"><SettingsNavigation />{children}</div></>;
}
