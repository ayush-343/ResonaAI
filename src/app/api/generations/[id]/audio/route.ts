import prisma from "@/lib/db";
import { APIError, apiError, requireWorkspace } from "@/lib/api";
import { audioURL } from "@/lib/r2";
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { orgId } = await requireWorkspace();
    const { id } = await context.params;
    const record = await prisma.generation.findUnique({ where: { id, orgId } });
    if (!record?.r2ObjectKey) throw new APIError(404, "This audio could not be found in your workspace.");
    return new Response(null, { status: 302, headers: { Location: await audioURL(record.r2ObjectKey), "Cache-Control": "private, no-store" } });
  } catch (error) { return apiError(error); }
}
