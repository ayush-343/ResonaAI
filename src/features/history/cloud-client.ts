import type { CloudRecord, SpeechRecord } from "./types";
async function readResponse(response: Response) {
  const body = await response.json().catch(() => null);
  if (!response.ok || !body) throw new Error(body?.error ?? (response.status === 401 ? "Sign in again to access workspace history. Your audio is still on this device." : "Cloud history is temporarily unavailable. Your audio is still on this device. Try again shortly."));
  return body;
}
export async function saveToCloud(record: SpeechRecord) {
  const form = new FormData();
  const { blob, saved, ...metadata } = record;
  void saved;
  form.set("metadata", JSON.stringify(metadata)); form.set("audio", blob, `${record.id}.wav`);
  return await readResponse(await fetch("/api/generations", { method: "POST", body: form }));
}
export async function listCloudRecords(): Promise<{ generations: CloudRecord[]; configured: boolean }> {
  return await readResponse(await fetch("/api/generations", { cache: "no-store" }));
}
export async function deleteCloudRecord(id: string) {
  return await readResponse(await fetch(`/api/generations/${id}`, { method: "DELETE" }));
}
