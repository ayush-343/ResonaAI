"use client";

import { Button } from "@components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function GenerateButton({
    size,
    disabled,
    isSubmitting,
    onSubmit,
    className,
}: {
    size?: "default" | "sm";
    disabled?: boolean;
    onSubmit: () => void;
    className?: string;
}) {
    return (
        <Button size={size} className={className} onClick={onSubmit} disabled={disabled}>
            {isSubmitting ? (
                <Spinner className="">
                    Generating...
                </Spinner>

            ) : (
                "Generate Speech"
            )
            }
        </Button>
    )
}