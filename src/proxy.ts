import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)", "/lab(.*)", "/vendor/(.*)"]);
const isOrgSelectRoute = createRouteMatcher(["/org-selection(.*)"]);


export default clerkMiddleware(async (auth, req) => {

    const { userId, orgId } = await auth();

    if (isPublicRoute(req)) {
        return NextResponse.next();
    }

    if (req.nextUrl.pathname.startsWith("/api/") && (!userId || !orgId)) {
        return NextResponse.json({ error: !userId ? "Sign in to continue." : "Select a workspace." }, { status: !userId ? 401 : 403 });
    }

    if (!userId) {
        await auth.protect();
    }

    if (isOrgSelectRoute(req)) {
        return NextResponse.next();
    }

    if (userId && !orgId) {
        const orgSelection = new URL("/org-selection", req.url);
        orgSelection.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
        return NextResponse.redirect(orgSelection);
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
