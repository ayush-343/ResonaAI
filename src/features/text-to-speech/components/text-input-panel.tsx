"use client";

import { useState } from "react";
import { Coins } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";


// TODO: Fix this page

import {
  TEXT_MAX_LENGTH,
  CONST_PR_UNIT as COST_PER_UNIT
} from "@/features/text-to-speech/data/constants";

// Mocking undeclared components to allow compilation
const SettingsDrawer = ({ children }: any) => <>{children}</>;
const VoiceSelectorButton = () => <div />;
const HistoryDrawer = () => <div />;
const GenerateButton = (props: any) => <button {...props} />;
const PromptSuggestions = ({ onSelect }: any) => <div />;

export function TextInputPanel() {
  const [text, setText] = useState("");
  const isSubmitting = false;
  const isValid = text.length > 0;
  const form = {
    handleSubmit: () => { },
    setFieldValue: (name: string, value: string) => setText(value),
  };

  return (
    <div className="flex h-full min-h-0 flex-col flex-1">
      {/* Text input area */}
      <div className="relative min-h-0 flex-1">

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing or paste your text here..."
          className="absolute inset-0 resize-none border-0 bg-transparent p-4 pb-6 lg:p-6 lg:pb-8 text-base! leading-relaxed tracking-tight shadow-none wrap-break-word focus-visible:ring-0"
          maxLength={TEXT_MAX_LENGTH}
          disabled={isSubmitting}
        />

        {/* Bottom fade overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-linear-to-t from-background to-transparent" />
      </div>
      {/* Action bar */}
      <div className="shrink-0 p-4 lg:p-6">
        {/* Mobile layout */}
        <div className="flex flex-col gap-3 lg:hidden">
          <div className="flex items-center gap-2">
            <SettingsDrawer>
              <VoiceSelectorButton />
            </SettingsDrawer>
            <HistoryDrawer />
          </div>
          <GenerateButton
            className="w-full"
            disabled={isSubmitting}
            isSubmitting={isSubmitting}
            onSubmit={() => form.handleSubmit()}
          />
        </div>
        {/* Desktop layout */}
        {text.length > 0 ? (
          <div className="hidden items-center justify-between lg:flex">
            <Badge variant="outline" className="gap-1.5 border-dashed">
              <Coins className="size-3 text-chart-5" />
              <span className="text-xs">
                <span className="tabular-nums">
                  ${(text.length * COST_PER_UNIT).toFixed(4)}
                </span>&nbsp;
                estimated
              </span>
            </Badge>
            <div className="flex items-center gap-3">
              <p className="text-xs tracking-tight">
                {text.length.toLocaleString()}
                <span className="text-muted-foreground">
                  &nbsp;/&nbsp;{TEXT_MAX_LENGTH.toLocaleString()} characters
                </span>
              </p>
              <GenerateButton
                size="sm"
                disabled={isSubmitting || !isValid}
                isSubmitting={isSubmitting}
                onSubmit={() => form.handleSubmit()}
              />
            </div>
          </div>
        ) : (
          <div className="hidden lg:block">
            <PromptSuggestions
              onSelect={(prompt) => form.setFieldValue("text", prompt)}
            />
          </div>
        )}
      </div>
    </div>
  );
};