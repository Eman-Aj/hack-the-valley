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