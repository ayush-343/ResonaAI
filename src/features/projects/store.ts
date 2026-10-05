import { allBlocks, audioKey, fingerprint, speechChunks, projectKey, type AudioRevision, type Project } from "./model";
const DATABASE = "resona-projects-v1";
const storageError = () => new Error("Device storage is full or unavailable. Keep this page open, free space, then retry saving.");
async function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore("projects", { keyPath: "key" }).createIndex("owner", "owner");
      request.result.createObjectStore("audio", { keyPath: "key" }).createIndex("projectKey", "projectKey");
    };
    request.onsuccess = () => { request.result.onversionchange = () => request.result.close(); resolve(request.result); };
    request.onerror = () => reject(storageError());
    request.onblocked = () => reject(new Error("Close other ResonaAI tabs and retry opening device storage."));
  });
}
async function read<T>(store: string, key: IDBValidKey, index?: string): Promise<T> {
  const db = await open();
  try { return await new Promise<T>((resolve, reject) => {
    const source = db.transaction(store).objectStore(store);
    const request = index ? source.index(index).getAll(key) : source.get(key);
    request.onsuccess = () => resolve(request.result); request.onerror = () => reject(storageError());
  }); } finally { db.close(); }
}
export async function listProjects(owner: string): Promise<Project[]> {
  return (await read<Project[]>("projects", owner, "owner")).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
export async function getProject(owner: string, id: string): Promise<Project | undefined> { return read("projects", projectKey(owner, id)); }
export async function saveProject(project: Project): Promise<Project> {
  const db = await open();
  const next = { ...project, key: projectKey(project.owner, project.id), revision: project.revision + 1, updatedAt: new Date().toISOString() };
  try { await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(["projects", "audio"], "readwrite"), store = tx.objectStore("projects");
    let conflict = false;
    const request = store.get(next.key);
    request.onsuccess = () => {
      if ((request.result?.revision ?? 0) !== project.revision) { conflict = true; tx.abort(); return; }
      store.put(next);
      const blocks = new Map(allBlocks(next).map(block => [block.id, block]));
      const previousBlocks = new Map(allBlocks(request.result ?? { chapters: [] }).map(block => [block.id, block]));
      const needsPrune = [...previousBlocks].some(([id, block]) => !blocks.has(id) || fingerprint(block) !== fingerprint(blocks.get(id)!));
      if (!needsPrune) return;
      const cursor = tx.objectStore("audio").index("projectKey").openCursor(next.key);
      cursor.onsuccess = () => {
        const item = cursor.result;
        if (!item) return;
        const audio = item.value as AudioRevision, block = blocks.get(audio.blockId);
        if (!block || audio.fingerprint !== fingerprint(block) || audio.chunk >= speechChunks(block).length) item.delete();
        item.continue();
      };
    };
    tx.oncomplete = () => resolve();
    tx.onabort = tx.onerror = () => reject(conflict ? new Error("This project changed in another tab. Copy your edits before reloading this page.") : storageError());
  }); return next; } finally { db.close(); }
}
export async function getAudio(owner: string, id: string, blockId: string, chunk: number): Promise<AudioRevision | undefined> { return read("audio", audioKey(owner, id, blockId, chunk)); }
export async function putAudio(audio: AudioRevision) {
  const db = await open();
  try { await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(["audio", "projects"], "readwrite");
    // A deleted project must never be resurrected by an in-flight generation.
    const request = tx.objectStore("projects").get(audio.projectKey);
    request.onsuccess = () => {
      const project = request.result as Project | undefined;
      const block = project && allBlocks(project).find(block => block.id === audio.blockId);
      if (block && fingerprint(block) === audio.fingerprint && audio.chunk < speechChunks(block).length) tx.objectStore("audio").put(audio);
      else tx.abort();
    };
    tx.oncomplete = () => resolve(); tx.onerror = tx.onabort = () => reject(storageError());
  }); } finally { db.close(); }
}
export async function deleteProject(owner: string, id: string) {
  const db = await open(), key = projectKey(owner, id);
  try { await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(["projects", "audio"], "readwrite");
    tx.objectStore("projects").delete(key);
    const cursor = tx.objectStore("audio").index("projectKey").openCursor(key);
    cursor.onsuccess = () => { const value = cursor.result; if (value) { value.delete(); value.continue(); } };
    tx.oncomplete = () => resolve(); tx.onerror = tx.onabort = () => reject(storageError());
  }); } finally { db.close(); }
}
