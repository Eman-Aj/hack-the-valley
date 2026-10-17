import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { AskStoryInputSchema, AskStoryOutputSchema, AskStoryOutput } from "../../../lib/validation";

// Offline fallback so the demo never breaks
// Offline fallback so the demo never breaks
function buildDeterministicFallback(
  question: string,
  verifiedMemories: any[]
): AskStoryOutput {
  const q = question.toLowerCase();
  const theoMemory = verifiedMemories.find(
    (m: any) =>
      m.familyStory.toLowerCase().includes("theo") ||
      m.verifiedFacts.people.some((p: any) => p.name.toLowerCase().includes("theo"))
  );

  if ((q.includes("baby") || q.includes("picture") || q.includes("theo") || q.includes("who")) && theoMemory) {
    return {
      answer: `That is your new grandson, Theo! Your family member (${theoMemory.contributorId}) shared this photo from the day you met him. ${theoMemory.verifiedFacts.comfortingDetails}`,
      isSupported: true,
      citedMemoryIds: [theoMemory.id],
      gentleFollowUpPrompt: "Would you like to hear more about the day they brought Theo to visit?",
    };
  }

  return {
    answer:
      "I don't see a confirmed family memory about that yet. We can ask your family to add it to your memory book next time they visit.",
    isSupported: false,
    citedMemoryIds: [],
    gentleFollowUpPrompt: "Would you like to look at the photos your family has already shared?",
  };
}

export async function POST(req: Request) {
  let fallbackMemories: any[] = [];
  let fallbackQuestion = "";

  try {
    const body = await req.json();
    
    // 1. Validate the incoming request
    const parsedInput = AskStoryInputSchema.safeParse(body);
    if (!parsedInput.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsedInput.error.flatten() },
        { status: 400 }
      );
    }

    const { residentPreferredName, question, verifiedMemories } = parsedInput.data;
    fallbackMemories = verifiedMemories;
    fallbackQuestion = question;

    // 2. Stop immediately if there are no verified memories
    if (verifiedMemories.length === 0) {
      return NextResponse.json({
        result: {
          answer: "There are no verified family memories saved for this topic yet.",
          isSupported: false,
          citedMemoryIds: [],
          gentleFollowUpPrompt: "Ask a family member to verify a memory in the Family Memories tab first.",
        },
        source: "empty_records",
      });
    }

    // 3. Use fallback if API key is missing
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        result: buildDeterministicFallback(question, verifiedMemories),
        source: "fallback_no_api_key",
      });
    }

    // 4. Connect to Google AI
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";

    const prompt = `You are "Ask My Story", a warm, reassuring memory assistant for ${residentPreferredName}.
CRITICAL SAFETY RULES:
1. Answer the question ONLY using the Verified Family Memories provided below.
2. NEVER invent people, dates, relationships, or events not explicitly in the records.
3. If the answer is not supported by the records, set isSupported to false, set citedMemoryIds to [], and gently say that you don't have that confirmed memory on file yet.
4. Keep the answer warm, clear, and 2-3 sentences max so it sounds natural when read aloud.

Resident's Question: "${question}"

Verified Family Memories (JSON):
${JSON.stringify(verifiedMemories, null, 2)}`;

    // 5. Force Gemini to return JSON
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: { type: Type.STRING },
            isSupported: { type: Type.BOOLEAN },
            citedMemoryIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            gentleFollowUpPrompt: { type: Type.STRING },
          },
          required: ["answer", "isSupported", "citedMemoryIds", "gentleFollowUpPrompt"],
        },
      },
    });

    const rawJson = JSON.parse(response.text || "{}");
    const validated = AskStoryOutputSchema.parse(rawJson);

    return NextResponse.json({ result: validated, source: "gemini" });
  } catch (error) {
    console.error("Ask story fallback triggered:", error);
    return NextResponse.json({
      result: buildDeterministicFallback(fallbackQuestion, fallbackMemories),
      source: "fallback_error",
    });
  }
}