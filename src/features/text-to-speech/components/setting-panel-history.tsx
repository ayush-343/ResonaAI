"use client";

import { AudioLines, AudioWaveform, Clock } from "lucide-react";

export function SettingPanelHistory() {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-2 p-8">
            <div className="relative flex w-25 items-center justify-center">
                <div className="absolute left-0 -rotate-30 rounded-full bg-muted ">
                    <AudioLines className="size-4 text-muted-foreground" />
                </div>

                <div className="relative z-10 rounded-full bg-foreground p-3">
                    <AudioWaveform className="size-4 text-background" />
                </div>

                <div className="absolute right-0 rotate-30 rounded-full bg-muted p-3">
                    <Clock className="size-4 text-muted-foreground" />
                </div>


            </div>
        </div>
    )
}