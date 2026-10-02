import type { Backend } from "./catalog";
export const BACKEND_PREFERENCE_KEY = "resona-processing-preference-v1";
export function readBackendPreference(storage: Pick<Storage, "getItem">): Backend | null {
  try {
    const value = storage.getItem(BACKEND_PREFERENCE_KEY);
    return value === "webgpu" || value === "wasm" ? value : null;
  } catch { return null; }
}
export function writeBackendPreference(storage: Pick<Storage, "setItem">, backend: Backend): boolean {
  try { storage.setItem(BACKEND_PREFERENCE_KEY, backend); return true; } catch { return false; }
}
