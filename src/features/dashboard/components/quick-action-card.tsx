import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { QuickAction } from "@/features/dashboard/data/quick-actions";

type QuickActionCardProps = QuickAction;

export function QuickActionCard({
    title,
    description,
    href,
}: QuickActionCardProps) {
    return (
        <div className="flex gap-4 rounded-xl border bg-card p-3">
            {/* Content */}
            <div className="flex flex-col justify-between py-1">
                <div className="space-y-1">
                    <h3 className="text-sm font-medium">{title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {description}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="xs"
                    className="w-fit"
                    asChild
                >
                    <Link href={href}>
                        Try now
                        <ArrowRight className="size-3" />
                    </Link>
                </Button>
            </div>
        </div>
    )
};
