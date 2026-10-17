import type {
  Resident,
  MemoryEntry,
  CareObservation,
  ObservationType,
  ObservationSourceRole,
  NursingNote,
} from "./types";

// All records below, including profile details, are fictional demonstration data.
// Values, diagnoses, and patterns are not clinically validated.

export const MOCK_RESIDENTS: Resident[] = [
  {
    id: "res_001",
    displayName: "Nancy Wilson",
    preferredName: "Nancy",
    age: 78,
    gender: "Female",
    pronouns: "She/her",
    diagnosis: "Moderate-stage Alzheimer's disease.",
    otherDiagnoses: [],
    careProfile: {
      facility: "Harbourview Senior Living",
      unit: "Memory care",
      room: "214",
      facilityPhone: "(555) 010-0100",
      primaryClinician: { name: "Dr. Maya Bennett", title: "MD", specialty: "Geriatric medicine", phone: "(555) 010-0110" },
      familyContacts: [
        { name: "David Wilson", relationship: "Son · primary contact", phone: "(555) 010-0120" },
        { name: "Grace Wilson", relationship: "Daughter", phone: "(555) 010-0121" },
      ],
    },
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
    displayName: "Robert Miller",
    preferredName: "Bob",
    age: 82,
    gender: "Male",
    pronouns: "He/him",
    diagnosis: "Parkinson's disease with early-stage dementia.",
    otherDiagnoses: [],
    careProfile: {
      facility: "Harbourview Senior Living",
      unit: "Garden wing",
      room: "118",
      facilityPhone: "(555) 010-0100",
      primaryClinician: { name: "Dr. Aaron Patel", title: "MD", specialty: "Neurology", phone: "(555) 010-0130" },
      familyContacts: [
        { name: "Grace Miller", relationship: "Daughter · primary contact", phone: "(555) 010-0140" },
        { name: "Peter Miller", relationship: "Son", phone: "(555) 010-0141" },
      ],
    },
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
  {
    id: "res_003",
    displayName: "Margaret Chen",
    preferredName: "Margaret",
    age: 75,
    gender: "Female",
    pronouns: "She/her",
    diagnosis: "Early-stage Alzheimer's disease.",
    otherDiagnoses: ["Osteoarthritis"],
    careProfile: {
      facility: "Willow Creek Residence",
      unit: "Cedar neighborhood",
      room: "306",
      facilityPhone: "(555) 010-0200",
      primaryClinician: { name: "Dr. Sofia Kim", title: "DO", specialty: "Family medicine", phone: "(555) 010-0210" },
      familyContacts: [
        { name: "Daniel Chen", relationship: "Spouse · primary contact", phone: "(555) 010-0220" },
        { name: "Lily Chen", relationship: "Daughter", phone: "(555) 010-0221" },
      ],
    },
    baseline: {
      meal_intake: 80,
      mobility_assistance: 1,
      sleep_disruption: 2,
    },
    sharingSettings: {
      shareMemoriesWithCareTeam: true,
      allowVoiceReadAloud: true,
    },
  },
  {
    id: "res_004",
    displayName: "George Davis",
    preferredName: "George",
    age: 81,
    gender: "Male",
    pronouns: "He/him",
    diagnosis: "Vascular dementia.",
    otherDiagnoses: ["Type 2 diabetes"],
    careProfile: {
      facility: "Willow Creek Residence",
      unit: "Maple neighborhood",
      room: "221",
      facilityPhone: "(555) 010-0200",
      primaryClinician: { name: "Dr. Marcus Reed", title: "MD", specialty: "Internal medicine", phone: "(555) 010-0230" },
      familyContacts: [
        { name: "Elena Davis", relationship: "Wife · primary contact", phone: "(555) 010-0240" },
        { name: "Jordan Davis", relationship: "Son", phone: "(555) 010-0241" },
      ],
    },
    baseline: {
      meal_intake: 90,
      mobility_assistance: 1,
      sleep_disruption: 2,
    },
    sharingSettings: {
      shareMemoriesWithCareTeam: false,
      allowVoiceReadAloud: false,
    },
  },
  {
    id: "res_005",
    displayName: "Evelyn Brooks",
    preferredName: "Evelyn",
    age: 79,
    gender: "Female",
    pronouns: "She/her",
    diagnosis: "Moderate-stage mixed dementia.",
    otherDiagnoses: ["COPD"],
    careProfile: {
      facility: "Meadowbrook Care Home",
      unit: "Willow wing",
      room: "107",
      facilityPhone: "(555) 010-0300",
      primaryClinician: { name: "Dr. Priya Shah", title: "MD", specialty: "Geriatric medicine", phone: "(555) 010-0310" },
      familyContacts: [
        { name: "Thomas Brooks", relationship: "Son · primary contact", phone: "(555) 010-0320" },
        { name: "Nina Brooks", relationship: "Daughter", phone: "(555) 010-0321" },
      ],
    },
    baseline: {
      meal_intake: 80,
      mobility_assistance: 2,
      sleep_disruption: 2,
    },
    sharingSettings: {
      shareMemoriesWithCareTeam: true,
      allowVoiceReadAloud: true,
    },
  },
  {
    id: "res_006",
    displayName: "Samuel Patel",
    preferredName: "Sam",
    age: 77,
    gender: "Male",
    pronouns: "He/him",
    diagnosis: "Dementia with Lewy bodies.",
    otherDiagnoses: ["Congestive heart failure"],
    careProfile: {
      facility: "Meadowbrook Care Home",
      unit: "Garden wing",
      room: "125",
      facilityPhone: "(555) 010-0300",
      primaryClinician: { name: "Dr. Elena Torres", title: "MD", specialty: "Neurology", phone: "(555) 010-0330" },
      familyContacts: [
        { name: "Asha Patel", relationship: "Daughter · primary contact", phone: "(555) 010-0340" },
        { name: "Ravi Patel", relationship: "Son", phone: "(555) 010-0341" },
      ],
    },
    baseline: {
      meal_intake: 85,
      mobility_assistance: 1,
      sleep_disruption: 1,
    },
    sharingSettings: {
      shareMemoriesWithCareTeam: true,
      allowVoiceReadAloud: true,
    },
  },
];

export const MOCK_MEMORIES: MemoryEntry[] = [
  {
    id: "mem_101",
    residentId: "res_001",
    createdAt: "2026-10-16T18:30:00Z",
    eventDate: "2026-10-16",
    imageUrl: "/demo/nancy-theo.jpg",
    familyStory:
      "David brought baby Theo to visit Nancy. She held him and smiled.",
    proposedCaption: "Nancy meets her new grandson, Theo.",
    verifiedFacts: {
      people: [
        { name: "Theo", relationship: "Grandson" },
        { name: "David", relationship: "Son" },
      ],
      eventDate: "2026-10-16",
      locationOrContext: "Care community garden",
      comfortingDetails:
        "Nancy spent time holding Theo during the family visit.",
    },
    verificationStatus: "verified",
    contributorId: "David",
    sharingPermissions: {
      visibleInAskMyStory: true,
      includeInCareBrief: true,
    },
  },
  {
    id: "mem_102",
    residentId: "res_002",
    createdAt: "2026-10-12T14:00:00Z",
    eventDate: "2026-10-12",
    imageUrl: "/demo/robert-jazz.jpg",
    familyStory:
      "Grace shared a photograph of Robert enjoying jazz music at home.",
    proposedCaption: "Robert enjoys a familiar jazz recording.",
    verifiedFacts: {
      people: [{ name: "Grace", relationship: "Daughter" }],
      eventDate: "2026-10-12",
      locationOrContext: "Home",
      comfortingDetails:
        "Robert's family shared that he has enjoyed jazz for many years.",
    },
    verificationStatus: "verified",
    contributorId: "Grace",
    sharingPermissions: {
      visibleInAskMyStory: true,
      includeInCareBrief: true,
    },
  },
  {
    id: "mem_103",
    residentId: "res_003",
    createdAt: "2026-10-11T16:00:00Z",
    eventDate: "2026-06-20",
    imageUrl: "/demo/margaret-garden.jpg",
    familyStory:
      "Olivia shared a photograph of Margaret tending her garden.",
    proposedCaption: "Margaret spends time in the garden.",
    verifiedFacts: {
      people: [{ name: "Olivia", relationship: "Granddaughter" }],
      eventDate: "2026-06-20",
      locationOrContext: "Family garden",
      comfortingDetails:
        "Margaret's family shared that gardening is an important interest.",
    },
    verificationStatus: "verified",
    contributorId: "Olivia",
    sharingPermissions: {
      visibleInAskMyStory: true,
      includeInCareBrief: true,
    },
  },
];

// Seven calendar days for every resident.
export const DATES = [
  "2026-10-10",
  "2026-10-11",
  "2026-10-12",
  "2026-10-13",
  "2026-10-14",
  "2026-10-15",
  "2026-10-16",
];

type ResidentSeries = {
  residentId: string;
  meal_intake: Array<number | null>;
  mobility_assistance: Array<number | null>;
  sleep_disruption: Array<number | null>;
};

const RESIDENT_SERIES: ResidentSeries[] = [
  // 1. Nancy: sustained changes across multiple domains.
  {
    residentId: "res_001",
    meal_intake: [85, 83, 80, 71, 64, 56, 50],
    mobility_assistance: [2, 2, 2, 2, 3, 3, 3],
    sleep_disruption: [1, 1, 2, 2, 3, 3, 3],
  },
  // 2. Robert: isolated anomalies followed by ordinary observations.
  {
    residentId: "res_002",
    meal_intake: [94, 93, 50, 94, 95, 94, 95],
    mobility_assistance: [0, 0, 0, 0, 0, 0, 0],
    sleep_disruption: [3, 3, 5, 3, 3, 3, 3],
  },
  // 3. Margaret: persistent change in meal intake alone.
  {
    residentId: "res_003",
    meal_intake: [80, 76, 70, 64, 60, 58, 55],
    mobility_assistance: [1, 1, 1, 1, 1, 1, 1],
    sleep_disruption: [2, 2, 2, 2, 2, 2, 2],
  },
  // 4. George: incomplete observation history.
  {
    residentId: "res_004",
    meal_intake: [90, null, null, 88, null, null, null],
    mobility_assistance: [1, null, null, 1, null, null, null],
    sleep_disruption: [2, null, null, null, null, null, null],
  },
  // 5. Evelyn: concerning earlier observations, recently returning toward baseline.
  {
    residentId: "res_005",
    meal_intake: [45, 50, 58, 67, 75, 80, 82],
    mobility_assistance: [3, 3, 3, 3, 2, 2, 2],
    sleep_disruption: [4, 4, 3, 3, 2, 2, 2],
  },
  // 6. Samuel: stable comparison resident.
  {
    residentId: "res_006",
    meal_intake: [84, 86, 85, 83, 86, 85, 84],
    mobility_assistance: [1, 1, 1, 1, 1, 1, 1],
    sleep_disruption: [1, 2, 1, 1, 1, 1, 1],
  },
];

const SOURCE_ROLE: Record<ObservationType, ObservationSourceRole> = {
  meal_intake: "dietary_aide",
  mobility_assistance: "care_aide",
  sleep_disruption: "overnight_staff",
};

function createSourceNote(type: ObservationType, value: number): string {
  switch (type) {
    case "meal_intake":
      return `Approximately ${value}% of the meal was recorded as consumed.`;
    case "mobility_assistance":
      return `Mobility assistance level recorded as ${value}/3. Higher values indicate more assistance.`;
    case "sleep_disruption":
      return `Sleep disruption recorded as ${value}/5. Higher values indicate more disruption.`;
  }
}

function buildObservations(series: ResidentSeries): CareObservation[] {
  const types: ObservationType[] = [
    "meal_intake",
    "mobility_assistance",
    "sleep_disruption",
  ];

  return types.flatMap((type) =>
    series[type].flatMap((value, index) => {
      if (value === null) return [];
      const date = DATES[index];
      return [
        {
          id: `obs_${series.residentId}_${date}_${type}`,
          residentId: series.residentId,
          date,
          type,
          value,
          sourceRole: SOURCE_ROLE[type],
          sourceNote: createSourceNote(type, value),
        },
      ];
    })
  );
}

export const MOCK_OBSERVATIONS: CareObservation[] =
  RESIDENT_SERIES.flatMap(buildObservations);

export const MOCK_NURSING_NOTES: NursingNote[] = [
  { id: "nursing_res_001_1", residentId: "res_001", recordedAt: "2026-10-17T09:10:00", category: "cognition_orientation", note: "Asked twice when her son would visit. Reviewed the family visit note and date together; she appeared reassured and joined the morning activity.", recordedBy: "Maya Chen", recordedByRole: "nurse" },
  { id: "nursing_res_002_1", residentId: "res_002", recordedAt: "2026-10-17T09:25:00", category: "communication", note: "Needed extra time to respond to questions during morning check-in. One question at a time and a quiet setting supported conversation.", recordedBy: "Jordan Lee", recordedByRole: "licensed_practical_nurse" },
  { id: "nursing_res_003_1", residentId: "res_003", recordedAt: "2026-10-17T10:00:00", category: "mood_behavior", note: "Became unsettled when the activity room was busier than usual. Offered a quieter seat and familiar music; she chose to stay and appeared more comfortable.", recordedBy: "Avery Moore", recordedByRole: "nurse" },
  { id: "nursing_res_004_1", residentId: "res_004", recordedAt: "2026-10-17T10:20:00", category: "safety", note: "Paused at the corridor junction and asked which way led to his room. Walked alongside him and pointed out the familiar room sign; arrived without incident.", recordedBy: "Taylor Reed", recordedByRole: "care_aide" },
  { id: "nursing_res_005_1", residentId: "res_005", recordedAt: "2026-10-17T10:45:00", category: "personal_care", note: "Needed a verbal cue to begin the usual morning grooming routine. Offered one step at a time and privacy; she completed the routine with time and encouragement.", recordedBy: "Morgan Price", recordedByRole: "nurse" },
  { id: "nursing_res_006_1", residentId: "res_006", recordedAt: "2026-10-17T11:05:00", category: "communication", note: "Conversation was easier to follow face-to-face in a quiet space. Used short sentences, allowed pauses, and confirmed his preference before moving on.", recordedBy: "Casey Patel", recordedByRole: "licensed_practical_nurse" },
];

export const MOCK_SCENARIOS = [
  {
    residentId: "res_001",
    label: "sustained_multi_domain_change",
    purpose: "Test a review signal from repeated changes across domains.",
    expectedBehavior: "needs_review",
  },
  {
    residentId: "res_002",
    label: "isolated_anomaly",
    purpose: "Test that one unusual day is not automatically treated as a persistent pattern.",
    expectedBehavior: "no_pattern_detected",
  },
  {
    residentId: "res_003",
    label: "persistent_single_domain_change",
    purpose: "Test the difference between a persistent single-domain change and a multi-domain signal.",
    expectedBehavior: "monitor",
  },
  {
    residentId: "res_004",
    label: "insufficient_observations",
    purpose: "Test that missing observations are not interpreted as normal.",
    expectedBehavior: "insufficient_data",
  },
  {
    residentId: "res_005",
    label: "historical_change_recently_near_baseline",
    purpose: "Test the distinction between recent state and earlier observations.",
    expectedBehavior: "no_pattern_detected",
  },
  {
    residentId: "res_006",
    label: "stable_baseline",
    purpose: "Control case for ordinary variation.",
    expectedBehavior: "no_pattern_detected",
  },
] as const;

export const MOCK_FOLLOW_UPS = [
  {
    id: "followup_001",
    residentId: "res_005",
    date: "2026-10-13",
    recordedByRole: "nurse",
    status: "completed",
    note: "Care-team review documented; continued observation requested.",
  },
  {
    id: "followup_002",
    residentId: "res_001",
    date: "2026-10-16",
    recordedByRole: "nurse",
    status: "pending",
    note: "Human review requested for the sustained changes shown in the observation history.",
  },
];

// Centralized server-side tracking for early cognitive decline detection
export const MOCK_QUESTION_LOGS: { 
  residentId: string; 
  timestamp: number 
}[] = [];

// Manual logs for family/caregivers to report observed memory lapses
export const MOCK_MEMORY_LAPSES: {
  id: string;
  residentId: string;
  reportedBy: string; // e.g., "family", "nurse", "care_aide"
  note: string;
  timestamp: number;
}[] = [];