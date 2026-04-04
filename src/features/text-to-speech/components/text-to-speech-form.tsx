import {z} from "zod";

import { formOptions } from "@tanstack/react-form";
import { useAppForm } from "@/hooks/use-app-form";
import React from "react";

const ttsFormSchema = z.object({
    text: z.string().min(1, "Text is required").max(5000, "Text must be less than 5000 characters"),
    voiceId: z.string().min(1, "Voice selection is required"),
    temperature: z.number(),
    topP: z.number(),
    topK: z.number(),
    repetitionPenalty: z.number(),
})


export type TTSSFormValues = z.infer<typeof ttsFormSchema>;

export const defaultTTSValues: TTSSFormValues = {
    text: "",
    voiceId: "",
    temperature: 0.8,
    topP: 0.95,
    topK: 1000,
    repetitionPenalty: 1.2
};

export const ttsFormOptions = formOptions({
    defaultValues: defaultTTSValues,
})

export function TextToSpeechForm({
    children,
    defaultValues,
}: {
    children: React.ReactNode;
    defaultValues?: TTSSFormValues;
    }) {
    const form = useAppForm({
        ...ttsFormOptions,
        defaultValues: defaultValues ?? defaultTTSValues,
        validators: {
            onSubmit: ttsFormSchema,
        },
        onSubmit: async () => {
            // Generation logic will go here, but for now we just simulate a delay
            await new Promise((resolve) => setTimeout(resolve, 2000));

        },
    });

    return <form.AppForm>{children}</form.AppForm>;
};

