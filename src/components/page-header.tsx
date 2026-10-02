import { Headphones, ThumbsUp } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "./ui/sidebar";
import { cn } from "@/lib/utils";


export function PageHeader({
    title,
    className,

}: {
    title: string;
    className?: string;
}) {
    return ( // here we use cn to combine the className passed as a prop with the default classes for the header
        <header className={cn("workspace-topbar flex shrink-0 items-center justify-between gap-3 border-b px-4 py-4", className,)}>

            <div className="flex items-center gap-2">
                <SidebarTrigger />
                <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            </div>
            <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" asChild>
                    <Link href="mailto:ayushsrivastavamail@gmail.com" aria-label="Send feedback">
                        <ThumbsUp />
                        <span className="hidden lg:block">Feedback</span>
                    </Link>
                </Button>

                <Button variant="outline" size="sm" asChild>
                    <Link href="mailto:ayushsrivastavamail@gmail.com" aria-label="Contact support">
                        <Headphones />
                        <span className="hidden lg:block">Need Help?</span>
                    </Link>
                </Button>
            </div>
        </header>
    )
}
