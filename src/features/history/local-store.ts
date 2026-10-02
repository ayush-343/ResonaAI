import type { SpeechRecord } from "./types";
const DATABASE = "resona-speech-v1";
async function openStore() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => {
      const store = request.result.createObjectStore("speech", { keyPath: "id" });
      store.createIndex("owner", "owner");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Local history is unavailable. Download your audio before closing this page."));
  });
}
export async function putLocalRecord(record: SpeechRecord) {
  const db = await openStore();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction("speech", "readwrite");
      transaction.objectStore("speech").put(record);
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(new Error("This device could not keep the audio. Download it before closing this page."));
      transaction.onerror = () => reject(new Error("Local storage is full or unavailable. Download the audio to keep it."));
    });
  } finally { db.close(); }
}
export async function listLocalRecords(owner: string): Promise<SpeechRecord[]> {
  const db = await openStore();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction("speech").objectStore("speech").index("owner").getAll(owner);
      request.onsuccess = () => resolve((request.result as SpeechRecord[]).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      request.onerror = () => reject(new Error("Local history could not be read."));
    });
  } finally { db.close(); }
}
export async function deleteLocalRecord(id: string) {
  const db = await openStore();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction("speech", "readwrite");
      transaction.objectStore("speech").delete(id);
      transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(new Error("Could not remove local audio."));
    });
  } finally { db.close(); }
}
