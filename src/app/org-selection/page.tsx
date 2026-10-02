
import { OrganizationList } from "@clerk/nextjs";

import { workspaceReturnPath } from "@/lib/workspace-return";

export default async function OrgSelectionPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
    const destination = workspaceReturnPath((await searchParams).next);
    return (
        <div className="flex min-h-screen items-center justify-center bg-background ">
            <OrganizationList
                hidePersonal
                afterCreateOrganizationUrl={destination}
                afterSelectOrganizationUrl={destination}
                appearance={{
                    elements: {
                        rootBox: "mx-auto",
                        card: "shadow-lg",
                    },
                }}
            />

        </div>
    )

}