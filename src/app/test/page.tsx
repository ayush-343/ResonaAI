import prisma from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

export default async function TestPage() {
    // This is just a test page to validate that our Prisma setup is working correctly
    if (process.env.NODE_ENV === "production") notFound();
    const { userId, orgId } = await auth();
    if (!userId || !orgId) notFound();
    const voices = await prisma.voice.findMany({
        where: { OR: [{ variant: "SYSTEM" }, { orgId, variant: "CUSTOM" }] },
    });
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">
                Voices ({voices.length})
            </h1>
            <ul className="space-y-2">
                {voices.map((voice) => (
                    <li key={voice.id}>
                        {voice.name} - {voice.variant}
                    </li>
                ))}
            </ul>
        </div>
    )
};
