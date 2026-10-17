import { MemoryEntry } from "./types";

/**
 * Returns ONLY verified memories permitted for Ask My Story,
 * ranked by keyword overlap with the user's question so Gemini gets the most relevant context first.
 */
export function getVerifiedMemoriesForQuestion(
  memories: MemoryEntry[],
  residentId: string,
  question: string
): MemoryEntry[] {
  const approved = memories.filter(
    (m) =>
      m.residentId === residentId &&
      m.verificationStatus === "verified" &&
      // Prevent private family memories from being read aloud if opted out
      m.sharingPermissions?.visibleInAskMyStory !== false 
  );

  const keywords = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  if (keywords.length === 0) return approved;

  return [...approved].sort((a, b) => {
    const score = (entry: MemoryEntry) => {
      const hay = [
        entry.familyStory,
        entry.proposedCaption,
        entry.verifiedFacts?.comfortingDetails || "",
        entry.verifiedFacts?.locationOrContext || "",
        ...(entry.verifiedFacts?.people || []).map((p) => `${p.name} ${p.relationship}`),
      ]
        .join(" ")
        .toLowerCase();

      return keywords.reduce((acc, kw) => (hay.includes(kw) ? acc + 1 : acc), 0);
    };
    return score(b) - score(a);
  });
}

/**
 * Returns ONLY verified memories permitted for the Caregiver's Care Brief.
 */
export function getVerifiedMemoriesForCareBrief(
  memories: MemoryEntry[],
  residentId: string
): MemoryEntry[] {
  return memories.filter(
    (m) =>
      m.residentId === residentId &&
      m.verificationStatus === "verified" &&
      // Respect privacy settings for the clinical handoff
      m.sharingPermissions?.includeInCareBrief !== false
  );
}