import prisma from "@/lib/db";
import { APIError, apiError, requireWorkspace } from "@/lib/api";
import { deleteAudio } from "@/lib/r2";
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { orgId } = await requireWorkspace(request);
    const { id } = await context.params;
    const record = await prisma.generation.findUnique({ where: { id, orgId } });
    if (!record) throw new APIError(404, "This generation could not be found in your workspace.");
    if (record.r2ObjectKey) await deleteAudio(record.r2ObjectKey);
    await prisma.generation.delete({ where: { id, orgId } });
    return Response.json({ deleted: true });
  } catch (error) { return apiError(error); }
}
