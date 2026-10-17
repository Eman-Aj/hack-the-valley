import type { MemoryEntry } from "./types";

const STORAGE_KEY = "memorylane.family-memories.v1";

/** Demo-only persistence in this browser. Replace with the project database/storage later. */
export function readSavedMemories(): MemoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(value) ? value as MemoryEntry[] : [];
  } catch {
    return [];
  }
}

export function saveMemory(memory: MemoryEntry): void {
  const existing = readSavedMemories().filter((item) => item.id !== memory.id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([memory, ...existing]));
  window.dispatchEvent(new Event("memorylane:memories-updated"));
}
