"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DEVICE_PATH, PROFILE_PATH, WORKSPACE_PATH, isActiveRoute } from "@/features/dashboard/data/navigation";
export function SettingsNavigation() {
  const pathname = usePathname();
  return <nav className="settings-navigation" aria-label="Settings sections">{[{ title: "Profile", href: PROFILE_PATH }, { title: "Workspace", href: WORKSPACE_PATH }, { title: "Device & Storage", href: DEVICE_PATH }].map(item => <Link key={item.href} href={item.href} aria-current={isActiveRoute(pathname, item.href) ? "page" : undefined}>{item.title}</Link>)}</nav>;
}
