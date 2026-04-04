import { VoicePreviewPlaceholder } from "@/features/text-to-speech/components/voice-preview-placeholder";
import { TextInputPanel } from "../components/text-input-panel";

import { SettingsPanel } from "../components/settings-panel";

export function TextToSpeechView() {
    return (
        <div className="flex min-h-0 flex-1 overflow-hidden">
            <div className="flex min-h-0 flex-col flex-1">
                <TextInputPanel />
                <VoicePreviewPlaceholder />
            </div>
            <SettingsPanel />
        </div>
    )
}