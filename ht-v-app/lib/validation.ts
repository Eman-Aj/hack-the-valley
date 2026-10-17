import { z } from "zod";

// --- JOB 1: DRAFT MEMORY SCHEMAS ---
export const DraftMemoryInputSchema = z.object({
  familyStory: z.string().min(1, "Please provide a short story or note."),
  contributorName: z.string().default("Family Member"),
  eventDateHint: z.string().optional(),
  imageBase64: z.string().optional(),
});

export const DraftMemoryOutputSchema = z.object({
  proposedCaption: z.string(),
  suggestedEventDate: z.string(),
  people: z.array(
    z.object({
      name: z.string(),
      relationship: z.string(),
    })
  ),
  locationOrContext: z.string(),
  comfortingDetails: z.string(),
  needsConfirmationNotes: z.array(z.string()),
});

export type DraftMemoryOutput = z.infer<typeof DraftMemoryOutputSchema>;


// --- JOB 2: ASK MY STORY SCHEMAS ---
export const AskStoryInputSchema = z.object({
  residentPreferredName: z.string().default("Nancy"),
  question: z.string().min(1, "Please enter a question."),
  verifiedMemories: z.array(
    z.object({
      id: z.string(),
      eventDate: z.string(),
      contributorId: z.string(),
      proposedCaption: z.string(),
      familyStory: z.string(),
      verifiedFacts: z.object({
        people: z.array(z.object({ name: z.string(), relationship: z.string() })),
        eventDate: z.string(),
        locationOrContext: z.string(),
        comfortingDetails: z.string(),
      }),
    })
  ),
});

export const AskStoryOutputSchema = z.object({
  answer: z.string(),
  isSupported: z.boolean(),
  citedMemoryIds: z.array(z.string()),
  gentleFollowUpPrompt: z.string(),
});

export type AskStoryOutput = z.infer<typeof AskStoryOutputSchema>;

// --- JOB 3: CARE BRIEF SCHEMAS ---
export const CareBriefInputSchema = z.object({
  residentId: z.string(),
});

export const CareBriefOutputSchema = z.object({
  shiftSummary: z.string(),
  clinicalAlerts: z.array(z.string()),
  conversationStarters: z.array(z.string()),
});

export type CareBriefOutput = z.infer<typeof CareBriefOutputSchema>;