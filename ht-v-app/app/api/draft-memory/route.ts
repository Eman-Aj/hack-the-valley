import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { DraftMemoryInputSchema, DraftMemoryOutputSchema } from "../../../lib/validation";

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
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";

    // 2. Build the base text prompt
    let contents: any[] = [
      `You are an AI assistant helping a family member (${contributorName}) draft a memory for a senior care resident.
      Extract the details from their note: "${familyStory}"
      Event Date Hint: ${eventDateHint || "Not provided"}`
    ];

    // 3. Inject Vision AI if an image was uploaded
    if (imageBase64) {
      // Clean the string just in case the frontend sends the data URI prefix
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      
      contents.push({
        inlineData: {
          data: cleanBase64,
          mimeType: "image/jpeg", 
        },
      });
      
      contents[0] += "\n\nAN IMAGE WAS PROVIDED. Look closely at the photo to enrich the 'comfortingDetails' and 'locationOrContext', and identify the mood or activities happening in the background.";
    }

    // 4. Force strict JSON return
    const response = await ai.models.generateContent({
      model,
      contents: contents,
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
                properties: { name: { type: Type.STRING }, relationship: { type: Type.STRING } }
              } 
            },
            locationOrContext: { type: Type.STRING },
            comfortingDetails: { type: Type.STRING },
            needsConfirmationNotes: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["proposedCaption", "suggestedEventDate", "people", "locationOrContext", "comfortingDetails", "needsConfirmationNotes"],
        },
      },
    });

    const rawJson = JSON.parse(response.text || "{}");
    const validated = DraftMemoryOutputSchema.parse(rawJson);

    return NextResponse.json({ draft: validated, source: imageBase64 ? "gemini_vision" : "gemini_text" });
  } catch (error) {
    console.error("Draft Memory Error:", error);
    return NextResponse.json({ error: "Failed to draft memory" }, { status: 500 });
  }
}