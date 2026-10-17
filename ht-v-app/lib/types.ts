export type SignalType = "meal_intake" | "mobility_assistance" | "sleep_disruption";
export type ObservationType = SignalType; // Alias so mock-db.ts and signal-engine.ts both work

export type SignalStatus = "needs_review" | "monitor" | "no_pattern_detected" | "insufficient_data";
export type VerificationStatus = "draft" | "verified";

export type ObservationSourceRole =
  | "dietary_aide"
  | "care_aide"
  | "overnight_staff"
  | "care_partner"
  | "nurse";

export interface CareObservation {
  id: string;
  residentId: string;
  date: string; // YYYY-MM-DD
  type: ObservationType;
  value: number;
  sourceRole: ObservationSourceRole;
  sourceNote: string;
}

export interface InteractionOutcome {
  id: string;
  residentId: string;
  timestamp: string;
  caregiverId: string;
  actionRecorded: string;
  observedResponse: string;
  followUpRequired: boolean;
  followUpNotes: string;
  relatedMemoryId?: string;
}

export interface Resident {
  id: string;
  displayName: string;
  preferredName: string;
  baseline: {
    meal_intake: number;
    mobility_assistance: number;
    sleep_disruption: number;
  };
  sharingSettings?: {
    shareMemoriesWithCareTeam: boolean;
    allowVoiceReadAloud: boolean;
  };
}

export interface VerifiedMemoryFacts {
  people: { name: string; relationship: string }[];
  eventDate: string;
  locationOrContext: string;
  comfortingDetails: string;
}

export interface MemoryEntry {
  id: string;
  residentId: string;
  createdAt: string;
  eventDate: string;
  image?: string;
  imageUrl?: string; // Added for the new mock-db.ts photos
  familyStory: string;
  proposedCaption: string;
  verifiedFacts: VerifiedMemoryFacts;
  verificationStatus: VerificationStatus;
  contributorId: string;
  sharingPermissions: {
    visibleInAskMyStory: boolean;
    includeInCareBrief: boolean;
  };
}
