import { Resident, MemoryEntry } from "./types";

// The synthesized "Account Manager" dataset
export const MOCK_RESIDENTS: Resident[] = [
  {
    id: "res_001",
    displayName: "Nancy W.",
    preferredName: "Nancy",
    baseline: {
      meal_intake: 85,
      mobility_assistance: 2,
      sleep_disruption: 1,
    },
    sharingSettings: {
      shareMemoriesWithCareTeam: true,
      allowVoiceReadAloud: true,
    },
  },
  {
    id: "res_002",
    displayName: "Robert M.",
    preferredName: "Bob",
    baseline: {
      meal_intake: 95,
      mobility_assistance: 0,
      sleep_disruption: 3,
    },
    sharingSettings: {
      shareMemoriesWithCareTeam: true,
      allowVoiceReadAloud: false,
    },
  },
];

export const MOCK_MEMORIES: MemoryEntry[] = [
  {
    id: "mem_101",
    residentId: "res_001", // Nancy's memory
    createdAt: "2026-10-15T10:00:00Z",
    eventDate: "2026-10-14",
    familyStory: "I brought baby Theo to visit Nancy today.",
    proposedCaption: "Meeting baby Theo.",
    verifiedFacts: {
      people: [{ name: "Theo", relationship: "Grandson" }, { name: "David", relationship: "Son" }],
      eventDate: "2026-10-14",
      locationOrContext: "Care community garden",
      comfortingDetails: "Nancy held baby Theo and smiled the whole time.",
    },
    verificationStatus: "verified",
    contributorId: "David",
    sharingPermissions: { visibleInAskMyStory: true, includeInCareBrief: true },
  },
];

import { CareObservation } from "./signal-engine"; // Add this import at the very top of mock-db.ts

// Simulated health logs from the last 3 days
export const MOCK_OBSERVATIONS: CareObservation[] = [
  // Nancy's baseline for meals is 85. These low numbers (60, 50) will trigger a "needs_review" alert.
  { date: "2026-10-15", type: "meal_intake", value: 60 },
  { date: "2026-10-16", type: "meal_intake", value: 50 },
  
  // Robert's baseline for sleep disruption is 3. This (3, 2) is normal, so it will return "no_pattern_detected".
  { date: "2026-10-15", type: "sleep_disruption", value: 3 },
  { date: "2026-10-16", type: "sleep_disruption", value: 2 },
];