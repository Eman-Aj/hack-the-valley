import { NextResponse } from "next/server";
import { AskStoryInputSchema, AskStoryOutputSchema, AskStoryOutput } from "../../../lib/validation";
import { generateGeminiJson } from "../../../lib/gemini-rest";

// Offline fallback so the demo never breaks. It only repeats confirmed record fields.
function buildDeterministicFallback(
  question: string,
  verifiedMemories: any[]
): AskStoryOutput {
  const q = question.toLowerCase();
  const words = q.split(/[^a-z0-9]+/).filter((word) => word.length > 2 && !["who", "what", "where", "when", "tell", "about", "this", "that", "with", "from", "family", "memory", "photo", "picture", "did", "does", "was", "are", "the", "and", "for"].includes(word));
  const ranked = verifiedMemories.map((memory: any) => {
    const text = [memory.proposedCaption, memory.familyStory, memory.verifiedFacts.locationOrContext, ...memory.verifiedFacts.people.map((person: any) => person.name), ...memory.verifiedFacts.people.map((person: any) => person.relationship)].join(" ").toLowerCase();
    return { memory, score: words.reduce((score, word) => score + (text.includes(word) ? 1 : 0), 0) };
  }).sort((a: any, b: any) => b.score - a.score);
  const match = ranked[0]?.score > 0 && (ranked.length === 1 || ranked[0].score > ranked[1].score) ? ranked[0].memory : verifiedMemories.length === 1 && /picture|photo|memory|this/.test(q) ? verifiedMemories[0] : null;

  if (match) {
    const facts = match.verifiedFacts;
    let answer: string | null = null;
    if ((q.includes("who") || q.includes("person")) && facts.people.length) {
      const people = facts.people.map((person: any) => `${person.name}${person.relationship ? `, ${person.relationship}` : ""}`);
      answer = `Your family confirmed that ${people.join(" and ")} ${people.length === 1 ? "is" : "are"} part of this memory.`;
    } else if (q.includes("where")) {
      answer = facts.locationOrContext ? `Your family shared that this memory is connected with ${facts.locationOrContext}.` : null;
    } else if (q.includes("when") || q.includes("date")) {
      answer = facts.eventDate ? `Your family recorded this memory on ${facts.eventDate}.` : null;
    } else {
      answer = [facts.comfortingDetails, match.familyStory, match.proposedCaption].filter(Boolean).join(" ");
    }
    if (answer) return { answer, isSupported: true, citedMemoryIds: [match.id], gentleFollowUpPrompt: "Would you like to hear another detail from this family memory?" };
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
    const rawJson = JSON.parse(await generateGeminiJson([{ text: prompt }], {
      type: "OBJECT",
      properties: {
        answer: { type: "STRING" },
        isSupported: { type: "BOOLEAN" },
        citedMemoryIds: { type: "ARRAY", items: { type: "STRING" } },
        gentleFollowUpPrompt: { type: "STRING" },
      },
      required: ["answer", "isSupported", "citedMemoryIds", "gentleFollowUpPrompt"],
    }));
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
