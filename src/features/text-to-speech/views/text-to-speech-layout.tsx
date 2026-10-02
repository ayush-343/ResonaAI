import { PageHeader } from "@/components/page-header";

export function TextToSpeechLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-0 flex-col">
            <PageHeader title="Speech Studio" />
            {children}
        </div>
    )
}
