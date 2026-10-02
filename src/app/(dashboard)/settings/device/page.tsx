import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DeviceSettings } from "@/features/settings/device-settings";
export const metadata = { title: "Device & Storage" };
export default async function DevicePage() {
  const { orgId } = await auth();
  if (!orgId) redirect("/org-selection");
  return <DeviceSettings key={orgId} owner={orgId} />;
}
