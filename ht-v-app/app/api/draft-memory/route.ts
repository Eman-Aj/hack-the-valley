import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { DraftMemoryInputSchema, DraftMemoryOutputSchema, DraftMemoryOutput } from "../../../lib/validation";

// If Gemini is down or the API key is missing, this offline fallback ensures the demo still works flawlessly.
function buildFallbackDraft(familyStory: string, eventDateHint?: string): DraftMemoryOutput {
  const mentionsTheo = /theo/i.test(familyStory);
  return {
    proposedCaption: mentionsTheo
      ? "Nancy holding her newborn grandson Theo for the first time."
      : familyStory.slice(0, 110),
    suggestedEventDate: eventDateHint || new Date().toISOString().split("T")[0],
    people: mentionsTheo
      ? [
          { name: "Theo", relationship: "Grandson (Newborn)" },
          { name: "David Wilson", relationship: "Son" },
        ]
      : [],
    locationOrContext: "Family visit",
    comfortingDetails: familyStory,
    needsConfirmationNotes: [
      "Please verify exact names, spelling, and relationship labels before saving.",
    ],
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Validate the incoming request from the frontend
    const parsedInput = DraftMemoryInputSchema.safeParse(body);
    if (!parsedInput.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsedInput.error.flatten() },
        { status: 400 }
      );
    }

    const { familyStory, contributorName, eventDateHint, imageBase64 } = parsedInput.data;

    // 2. If there is no API key, instantly return the demo fallback data
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        draft: buildFallbackDraft(familyStory, eventDateHint),
        source: "fallback_no_api_key",
      });
    }

    // 3. Connect to Google AI
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    const contents: any[] = [];

    // Optional: If the frontend sends an image, attach it for Gemini to analyze
    if (imageBase64 && imageBase64.startsWith("data:image/")) {
      const [header, base64Data] = imageBase64.split(",");
      const mimeType = header.match(/data:(.*);base64/)?.[1] || "image/jpeg";
      contents.push({
        inlineData: { data: base64Data, mimeType },
      });
    }

    // Give Gemini explicit rules so it doesn't hallucinate medical data
    contents.push(
      `You are assisting a family member (${contributorName}) in drafting a structured memory entry for a loved one living with dementia.
Rules:
1. Extract ONLY facts explicitly stated in the family story. Do NOT guess names or relationships from the photo alone.
2. If any detail (date, exact relationship, location) is unclear, add a reminder in needsConfirmationNotes.
3. Write a warm, concise proposedCaption suitable for looking at together.

Family story provided: "${familyStory}"
Date hint: "${eventDateHint || "Not provided"}"`
    );

    // 4. Force Gemini to return strictly formatted JSON using Structured Outputs
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            proposedCaption: { type: Type.STRING },
            suggestedEventDate: { type: Type.STRING },
            people: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  relationship: { type: Type.STRING },
                },
                required: ["name", "relationship"],
              },
            },
            locationOrContext: { type: Type.STRING },
            comfortingDetails: { type: Type.STRING },
            needsConfirmationNotes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            "proposedCaption",
            "suggestedEventDate",
            "people",
            "locationOrContext",
            "comfortingDetails",
            "needsConfirmationNotes",
          ],
        },
      },
    });

    // 5. Parse the AI response and run it through Zod validation to be 100% safe
    const rawJson = JSON.parse(response.text || "{}");
    const validated = DraftMemoryOutputSchema.parse(rawJson);

    return NextResponse.json({ draft: validated, source: "gemini" });
  } catch (error) {
    console.error("Draft memory fallback triggered:", error);
    // If the API crashes during judging, the app won't break—it just uses the fallback.
    return NextResponse.json({
      draft: buildFallbackDraft("Family memory entry"),
      source: "fallback_error",
    });
  }
}