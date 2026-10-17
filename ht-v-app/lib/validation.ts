import { z } from "zod";

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