import { NextResponse } from "next/server";
import { DraftMemoryInputSchema, DraftMemoryOutputSchema } from "../../../lib/validation";
import { generateGeminiJson } from "../../../lib/gemini-rest";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Validate incoming data (imageBase64 is optional in your Zod schema)
    const parsed = DraftMemoryInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const { familyStory, contributorName, eventDateHint, imageBase64 } = parsed.data;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "AI drafting is not configured yet. Add GEMINI_API_KEY to the server environment, or save this memory with your own reviewed details." }, { status: 503 });
    }

    // Photos can help describe visible context, but must never establish identity.
    const parts: ({ text: string } | { inline_data: { data: string; mime_type: string } })[] = [
      { text:
      `You help ${contributorName} prepare a family memory for review. Draft a concise, warm caption using this family-provided story: "${familyStory}".
Event date provided by family: ${eventDateHint || "Not provided"}.
Treat the family story and date as the only sources for names, identities, relationships, dates, and events. Never identify anyone from the image or infer their relationship, age, location, emotion, or personal history. The image may only support cautious, generic visible context (for example, flowers or a table); if uncertain, leave it blank and add a confirmation note. Keep every output as a proposal for a family member to review.`
      },
    ];

    // Accept a data URL from the browser and preserve its actual supported image MIME type.
    if (imageBase64) {
      const dataUrl = imageBase64.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/i);
      const rawBase64 = dataUrl ? dataUrl[2].replace(/\s/g, "") : imageBase64;
      const mimeType = dataUrl ? dataUrl[1].toLowerCase() : "image/jpeg";
      if (!/^[A-Za-z0-9+/]+={0,2}$/.test(rawBase64)) {
        return NextResponse.json({ error: "The uploaded image could not be read. Please choose a JPEG, PNG, or WebP image." }, { status: 400 });
      }
      parts.push({
        inline_data: {
          data: rawBase64,
          mime_type: mimeType,
        },
      });
    }

    const rawJson = JSON.parse(await generateGeminiJson(parts, {
      type: "OBJECT",
      properties: {
        proposedCaption: { type: "STRING" },
        suggestedEventDate: { type: "STRING" },
        people: {
          type: "ARRAY",
          items: { type: "OBJECT", properties: { name: { type: "STRING" }, relationship: { type: "STRING" } }, required: ["name", "relationship"] },
        },
        locationOrContext: { type: "STRING" },
        comfortingDetails: { type: "STRING" },
        needsConfirmationNotes: { type: "ARRAY", items: { type: "STRING" } },
      },
      required: ["proposedCaption", "suggestedEventDate", "people", "locationOrContext", "comfortingDetails", "needsConfirmationNotes"],
    }));
    const validated = DraftMemoryOutputSchema.parse(rawJson);

    return NextResponse.json({ draft: validated, source: imageBase64 ? "gemini_vision" : "gemini_text" });
  } catch (error) {
    console.error("Draft Memory Error:", error);
    return NextResponse.json({ error: "Failed to draft memory" }, { status: 500 });
  }
}
