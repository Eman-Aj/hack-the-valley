export interface QuestionActivityEvent {
  id: string;
  residentId: string;
  askedAt: string;
}

const STORAGE_KEY = "memorylane.question-activity.v1";
const ACTIVITY_EVENT = "memorylane:question-activity-updated";

function readEvents(): QuestionActivityEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed as QuestionActivityEvent[] : [];
  } catch {
    return [];
  }
}

export function readQuestionActivity(residentId: string): QuestionActivityEvent[] {
  return readEvents().filter((event) => event.residentId === residentId);
}

/** Stores question timing only; question text and answers are never retained here. */
export function recordQuestionActivity(residentId: string): void {
  const events = readEvents();
  const now = Date.now();
  const retentionStart = now - 90 * 24 * 60 * 60 * 1000;
  const retained = events.filter((event) => Date.parse(event.askedAt) >= retentionStart);
  retained.push({ id: `question_${now}_${Math.random().toString(36).slice(2, 8)}`, residentId, askedAt: new Date(now).toISOString() });
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(retained));
    window.dispatchEvent(new Event(ACTIVITY_EVENT));
  } catch {
    // An unavailable local store should never prevent the resident from asking a question.
  }
}

export const QUESTION_ACTIVITY_EVENT = ACTIVITY_EVENT;
