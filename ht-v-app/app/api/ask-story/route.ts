import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { MOCK_QUESTION_LOGS } from "../../../lib/mock-db";

// Deterministic offline fallback
function buildFallbackAnswer(question: string) {
  if (question.toLowerCase().includes("baby")) {
    return {
      answer: "That is your new grandson, Theo! David brought him to visit you in the garden today.",
      gentleFollowUpPrompt: "Would you like to hear more about David's visit?",
    };
  }
  return {
    answer: "Your family loves spending time with you. Let's look at some of your favorite photos together.",
    gentleFollowUpPrompt: "Is there a specific memory you'd like to talk about?",
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { residentId, residentPreferredName, question, verifiedMemories } = body;

    // 1. Log interaction centrally for clinical tracking
    MOCK_QUESTION_LOGS.push({
      residentId,
      timestamp: Date.now(),
    });

    // 2. Calculate interaction frequency over the last hour
    const ONE_HOUR_MS = 60 * 60 * 1000;
    const recentQuestions = MOCK_QUESTION_LOGS.filter(
      (log) => log.residentId === residentId && (Date.now() - log.timestamp) < ONE_HOUR_MS
    );

    // 3. Generate clinical alert if threshold crossed
    let cognitiveAlert = null;
    if (recentQuestions.length >= 3) {
      cognitiveAlert = `Elevated interaction: ${residentPreferredName} has asked ${recentQuestions.length} questions in the past hour. Consider a gentle human check-in.`;
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        result: buildFallbackAnswer(question),
        metrics: { questionsPastHour: recentQuestions.length, cognitiveAlert },
        source: "fallback_no_api_key",
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";

    const prompt = `You are an AI companion for ${residentPreferredName}. Answer their question warmly using ONLY the provided verified memories. Keep it to 1-2 sentences. Then provide a gentle follow-up prompt.
QUESTION: ${question}
VERIFIED MEMORIES: ${JSON.stringify(verifiedMemories)}`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: { type: Type.STRING },
            gentleFollowUpPrompt: { type: Type.STRING },
          },
          required: ["answer", "gentleFollowUpPrompt"],
        },
      },
    });

    const parsedJson = JSON.parse(response.text || "{}");

    return NextResponse.json({
      result: parsedJson,
      metrics: { questionsPastHour: recentQuestions.length, cognitiveAlert },
      source: "gemini",
    });
  } catch (error) {
    console.error("Ask Story Error:", error);
    return NextResponse.json({ error: "Failed to process question" }, { status: 500 });
  }
}