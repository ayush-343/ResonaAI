import "server-only";
import { auth } from "@clerk/nextjs/server";
export class APIError extends Error { constructor(public status: number, message: string) { super(message); } }
export async function requireWorkspace(request?: Request) {
  const { userId, orgId } = await auth();
  if (!userId) throw new APIError(401, "Sign in to use cloud history.");
  if (!orgId) throw new APIError(403, "Choose a workspace to use cloud history.");
  if (request && request.headers.get("origin") !== new URL(request.url).origin) throw new APIError(403, "The save request came from a different site. Refresh and retry.");
  return { userId, orgId };
}
export function apiError(error: unknown) {
  if (error instanceof APIError) return Response.json({ error: error.message }, { status: error.status });
  console.error("Cloud history request failed", error instanceof Error ? error.name : "UnknownError");
  return Response.json({ error: "Cloud history is unavailable. Keep your local audio and try again." }, { status: 503 });
}
export async function limitedFormData(request: Request, maxBytes: number) {
  if (!request.body) throw new APIError(400, "No audio was attached.");
  const reader = request.body.getReader();
  let size = 0; const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    size += value.byteLength;
    if (size > maxBytes) { await reader.cancel(); throw new APIError(413, "Audio is too large to save. Download it or generate a shorter script."); }
    chunks.push(value);
  }
  const body = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  try { return await new Response(body, { headers: { "Content-Type": request.headers.get("content-type") ?? "" } }).formData(); }
  catch { throw new APIError(400, "The audio upload could not be read."); }
}
