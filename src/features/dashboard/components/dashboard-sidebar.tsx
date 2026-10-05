"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";

import { type LucideIcon, Home, LayoutGrid, AudioLines, Settings, History, FolderOpen } from "lucide-react";

import Link from "next/link";
import { DASHBOARD_ROUTES, PROFILE_PATH, WORKSPACE_PATH, isActiveRoute } from "../data/navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface MenuItem {
    title: string;
    icon: LucideIcon;
    url?: string;
    onClick?: () => void;
}

interface NavSectionProps {
    label?: string;
    items: MenuItem[];
    pathname: string;
}

function NavSection({ label, items, pathname }: NavSectionProps) {
    const { setOpenMobile } = useSidebar();
    return (
        <SidebarGroup>
            {label && (
                <SidebarGroupLabel className="text-[13px] uppercase text-muted-foreground">
                    {label}
                </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild={!!item.url}
                                isActive={
                                    item.url ? isActiveRoute(pathname, item.url) : false}
                                onClick={item.onClick}
                                tooltip={item.title}
                                className="h-9 px-3 py-2 text-[13px] tracking-tight font-medium border border-transparent data-[active=true]:border-border data-[active=true]:shadow-[0px_1px_1px_0px_rgba(44,54,53,0.03),inset_0px_0px_0px_2px_white]"
                            >
                                {item.url ? (
                                    <Link href={item.url} aria-current={isActiveRoute(pathname, item.url) ? "page" : undefined} onClick={() => setOpenMobile(false)}>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </Link>
                                ) : (
                                    <>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </>

                                )}
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}

export function DashboardSidebar() {

    const pathname = usePathname();

    const icons = [Home, AudioLines, FolderOpen, LayoutGrid, History, Settings];
    const mainMenuItems: MenuItem[] = DASHBOARD_ROUTES.map((item, index) => ({ ...item, icon: icons[index] }));

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="flex flex-col gap-4 pt-4">
                <div className="flex items-center gap-2 pl-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:pl-0">
                    <Image src="/logo.svg" alt="Logo" width={32} height={32} className="rounded-sm" />
                    <span className="group-data-[collapsible=icon]:hidden font-semibold text-lg tracking-tighter text-foreground">
                        ResonaAI
                    </span>
                    <SidebarTrigger className="ml-auto" />
                </div>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <OrganizationSwitcher
                            organizationProfileMode="navigation"
                            organizationProfileUrl={WORKSPACE_PATH}
                            afterSelectOrganizationUrl="/home"
                            hidePersonal
                            fallback={
                                <Skeleton className="h-8.5 w-full group-data-[collapsible=icon]:size-8 
                                rounded-md border border-border bg-white" />
                            }
                            appearance={{
                                elements: {
                                    rootBox:
                                        "w-full! group-data-[collapsible=icon]:w-auto! group-data-[collapsible=icon]:flex! group-data-[collapsible=icon]:justify-center!",
                                    organizationSwitcherTrigger:
                                        "w-full! justify-between! bg-white! border! border-border! rounded-md! pl-1! pr-2! py-1! gap-3! group-data-[collapsible=icon]:w-auto! group-data-[collapsible=icon]:p-1! shadow-[0px_1px_1.5px_0px_rgba(44,54,53,0.03)]!",
                                    organizationPreview: "gap-2!",
                                    organizationPreviewAvatarBox: "size-6! rounded-sm!",
                                    organizationPreviewTextContainer:
                                        "text-xs! tracking-tight! font-medium! text-foreground! group-data-[collapsible=icon]:hidden!",
                                    organizationPreviewMainIdentifier: "text-[13px]!",
                                    organizationSwitcherTriggerIcon:
                                        "size-4! text-sidebar-foreground! group-data-[collapsible=icon]:hidden!",
                                },
                            }}
                        />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <div className="border-b border-border" />
            <SidebarContent>
                <NavSection items={mainMenuItems.filter(item => item.url !== "/settings")} pathname={pathname} />
            </SidebarContent>
            <SidebarFooter className="gap-3 py-3">
                <NavSection items={mainMenuItems.filter(item => item.url === "/settings")} pathname={pathname} />
                <SidebarMenu>
                    <SidebarMenuItem>
                        <UserButton
                            userProfileMode="navigation"
                            userProfileUrl={PROFILE_PATH}
                            showName
                            fallback={
                                <Skeleton className="h-8.5 w-full group-data-[collapsible=icon]:size-8 rounded-md border border-border bg-white" />
                            }
                            appearance={{
                                elements: {
                                    rootBox:
                                        "w-full! group-data-[collapsible=icon]:w-auto! group-data-[collapsible=icon]:flex! group-data-[collapsible=icon]:justify-center!",
                                    userButtonTrigger:
                                        "w-full! justify-between! bg-white! border! border-border! rounded-md! pl-1! pr-2! py-1! shadow-[0px_1px_1.5px_0px_rgba(44,54,53,0.03)]!  group-data-[collapsible=icon]:w-auto! group-data-[collapsible=icon]:p-1! group-data-[collapsible=icon]:after:hidden! [--border:color-mix(in_srgb, transparent, var(--clerk-color-neutral, #000000)_15%)]!",
                                    userButtonBox: "flex-row-reverse! gap-2!",
                                    userButtonOuterIdentifier: "text-[13px]! tracking-tight! font-medium! text-foreground! pl-0! group-data-[collapsible=icon]:hidden!",
                                    userButtonAvatarBox: "size-6! rounded-sm!", // Adjust avatar size for both states

                                }
                            }
                            }
                        />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
