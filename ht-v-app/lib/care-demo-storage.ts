import type { CareObservation, InteractionOutcome } from "./types";
import { MOCK_OBSERVATIONS } from "./mock-db";

const OBSERVATIONS_KEY = "memorylane.demo-observations.v1";
const HANDOFFS_KEY = "memorylane.demo-handoffs.v1";

function readList<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(parsed) ? parsed as T[] : [];
  } catch { return []; }
}

export function readCareObservations(): CareObservation[] {
  return [...MOCK_OBSERVATIONS, ...readList<CareObservation>(OBSERVATIONS_KEY)];
}

export function addCareObservation(observation: CareObservation): void {
  const current = readList<CareObservation>(OBSERVATIONS_KEY);
  window.localStorage.setItem(OBSERVATIONS_KEY, JSON.stringify([observation, ...current]));
  window.dispatchEvent(new Event("memorylane:care-data-updated"));
}

export function readHandoffs(): InteractionOutcome[] {
  return readList<InteractionOutcome>(HANDOFFS_KEY);
}

export function addHandoff(outcome: InteractionOutcome): void {
  const current = readHandoffs();
  window.localStorage.setItem(HANDOFFS_KEY, JSON.stringify([outcome, ...current]));
  window.dispatchEvent(new Event("memorylane:care-data-updated"));
}
