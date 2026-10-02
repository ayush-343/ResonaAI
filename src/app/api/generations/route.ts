import { createHash } from "node:crypto";
import prisma from "@/lib/db";
import { APIError, apiError, limitedFormData, requireWorkspace } from "@/lib/api";
import { deleteAudio, storageConfigured, uploadAudio } from "@/lib/r2";
import { MAX_AUDIO_BYTES, speechMetadataSchema, validateWav } from "@/features/history/validation";
import { getVoice } from "@/features/tts-engine/catalog";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  try {
    const { orgId } = await requireWorkspace();
    if (!storageConfigured()) return Response.json({ configured: false, generations: [] });
    const records = await prisma.generation.findMany({ where: { orgId, r2ObjectKey: { not: null } }, orderBy: { createdAt: "desc" }, take: 50 });
    return Response.json({ configured: true, generations: records.map(record => ({
      id: record.id, text: record.text, voiceName: record.voiceName, language: record.languageMode ?? "en",
      backend: (record.settings as { backend?: string } | null)?.backend ?? "cloud",
      modelId: record.modelId, modelRevision: record.modelRevision, engineVersion: record.engineVersion,
      duration: record.audioDuration, elapsedMs: record.elapsedMs, firstAudioMs: record.firstAudioMs,
      createdAt: record.createdAt.toISOString(), audioUrl: `/api/generations/${record.id}/audio`,
    })) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  try {
    const { orgId } = await requireWorkspace(request);
    if (!storageConfigured()) throw new APIError(503, "Cloud storage is not configured yet. Your audio is available on this device.");
    const form = await limitedFormData(request, MAX_AUDIO_BYTES + 128 * 1024);
    let metadata: unknown;
    try { metadata = JSON.parse(String(form.get("metadata"))); } catch { throw new APIError(400, "Speech metadata is invalid."); }
    const parsed = speechMetadataSchema.safeParse(metadata);
    if (!parsed.success) throw new APIError(400, "Speech metadata is invalid. Generate the audio again with the current engine.");
    const input = parsed.data;
    if (input.owner !== orgId) throw new APIError(409, "This audio belongs to a different workspace. Switch back to save it.");
    const file = form.get("audio");
    if (!(file instanceof File)) throw new APIError(400, "Attach the generated WAV audio.");
    const bytes = new Uint8Array(await file.arrayBuffer());
    let audio: ReturnType<typeof validateWav>;
    try { audio = validateWav(bytes); } catch (error) { throw new APIError(400, (error as Error).message); }
    const digest = createHash("sha256").update(JSON.stringify(input)).update(bytes).digest("hex");
    const existing = await prisma.generation.findUnique({ where: { id: input.id } });
    if (existing) {
      if (existing.orgId !== orgId || existing.payloadDigest !== digest) throw new APIError(409, "The save identifier already belongs to another result.");
      return Response.json({ id: existing.id });
    }
    const key = `generations/${orgId}/${input.id}/${digest}.wav`;
    await uploadAudio(key, bytes);
    try {
      await prisma.generation.create({ data: {
        id: input.id, orgId, text: input.text, voiceName: getVoice(input.voiceId)!.name,
        r2ObjectKey: key, modelId: input.modelId, modelRevision: input.modelRevision, engineVersion: input.engineVersion,
        languageMode: input.language, settings: { voiceId: input.voiceId, speed: input.speed, backend: input.backend, spokenText: input.spokenText },
        audioDuration: audio.duration, sampleRate: audio.sampleRate, elapsedMs: input.elapsedMs, firstAudioMs: input.firstAudioMs, payloadDigest: digest,
      } });
    } catch (error) {
      const winner = await prisma.generation.findUnique({ where: { id: input.id } });
      if (winner?.orgId === orgId && winner.payloadDigest === digest) return Response.json({ id: winner.id });
      await deleteAudio(key).catch(() => console.error("Orphan audio cleanup failed"));
      throw error;
    }
    return Response.json({ id: input.id }, { status: 201 });
  } catch (error) { return apiError(error); }
}
