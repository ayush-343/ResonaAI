interface Slider {
    id: "temperature" | "topP" | "topK" | "repetitionPenalty";
    label: string;
    leftLabel: string;
    rightLabel: string;
    step: number;
    min: number;
    max: number;
    defaultValue: number;
};

export const sliders: Slider[] = [
    {
        id: "temperature",
        label: "Creativity",
        leftLabel: "Consistent",
        rightLabel: "Expressive",
        step: 0.1,
        min: 0,
        max: 2,
        defaultValue: 0.8
    },
    {
        id: "topP",
        label: "Voice Variety",
        leftLabel: "Stable",
        rightLabel: "Dynamic",
        step: 0.05,
        min: 0,
        max: 1,
        defaultValue: 0.95
    },
    {
        id: "topK",
        label: "Expression Range",
        leftLabel: "Subtle",
        rightLabel: "Dramatic",
        step: 100,
        min: 1,
        max: 10000,
        defaultValue: 1000
    },

    {
        id: "repetitionPenalty",
        label: "Natural Flow",
        leftLabel: "Rhythmic",
        rightLabel: "Varied",
        step: 0.1,
        min: 1,
        max: 2,
        defaultValue: 1.2
    }
]
   