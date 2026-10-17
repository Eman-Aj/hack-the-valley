import { NextResponse } from "next/server";
import { CareBriefInputSchema, CareBriefOutputSchema } from "../../../lib/validation";
import { generateGeminiJson } from "../../../lib/gemini-rest";
import { evaluateHealthSignals } from "../../../lib/signal-engine";
import { MOCK_RESIDENTS, MOCK_OBSERVATIONS, MOCK_MEMORIES } from "../../../lib/mock-db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Validate the incoming request
    const parsedInput = CareBriefInputSchema.safeParse(body);
    if (!parsedInput.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsedInput.error.flatten() },
        { status: 400 }
      );
    }

    const { residentId } = parsedInput.data;

    // 2. Fetch the resident data
    const resident = MOCK_RESIDENTS.find(r => r.id === residentId);
    if (!resident) {
      return NextResponse.json({ error: "Resident not found" }, { status: 404 });
    }

    // 3. Run the deterministic engine for clinical flags
    const healthSignals = evaluateHealthSignals(resident, MOCK_OBSERVATIONS);

    // 4. Fetch memories approved for the care team
    const careTeamMemories = MOCK_MEMORIES.filter(
      m => m.residentId === residentId && 
      m.verificationStatus === "verified" && 
      m.sharingPermissions.includeInCareBrief !== false
    );

    // 5. Connect to Google AI
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    const prompt = `You are an AI nursing assistant generating a shift-change Care Brief for ${resident.preferredName}.
CRITICAL INSTRUCTIONS:
1. Review the Health Signals below. Summarize any "needs_review" alerts clearly in the clinicalAlerts array.
2. Review the Verified Memories. Create 1-2 warm conversation starters for the incoming nurse based ONLY on these facts.
3. Keep the shift summary professional, concise, and empathetic.

HEALTH SIGNALS:
${JSON.stringify(healthSignals, null, 2)}

VERIFIED MEMORIES:
${JSON.stringify(careTeamMemories, null, 2)}`;

    // 6. Force Gemini to return structured JSON
    const rawJson = JSON.parse(await generateGeminiJson([{ text: prompt }], {
      type: "OBJECT",
      properties: {
        shiftSummary: { type: "STRING" },
        clinicalAlerts: { type: "ARRAY", items: { type: "STRING" } },
        conversationStarters: { type: "ARRAY", items: { type: "STRING" } },
      },
      required: ["shiftSummary", "clinicalAlerts", "conversationStarters"],
    }));
    const validated = CareBriefOutputSchema.parse(rawJson);

    return NextResponse.json({ result: validated, residentName: resident.preferredName });
  } catch (error) {
    console.error("Care Brief Error:", error);
    return NextResponse.json({ error: "Failed to generate Care Brief" }, { status: 500 });
  }
}
