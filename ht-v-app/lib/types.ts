export type SignalType = "meal_intake" | "mobility_assistance" | "sleep_disruption";
export type SignalStatus = "needs_review" | "monitor" | "no_pattern_detected" | "insufficient_data";
export type VerificationStatus = "draft" | "verified";

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