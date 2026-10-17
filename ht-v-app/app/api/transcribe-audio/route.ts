import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

// Deterministic fallback so the live voice demo never fails on stage
function buildFallbackTranscript(context?: string): string {
  if (context === "family_memory") {
    return "I brought baby Theo to visit Nancy today in the garden. She held him and smiled the whole time.";
  }
  return "Who is the baby in this picture with me?";
}

export async function POST(req: Request) {
  let fallbackContext: string | undefined;

  try {
    const body = await req.json();
    const { audioBase64, mimeType = "audio/webm", context } = body;
    fallbackContext = context;

    if (!audioBase64 || typeof audioBase64 !== "string") {
      return NextResponse.json(
        { error: "Missing audioBase64 payload" },
        { status: 400 }
      );
    }

    // Strip data URL prefix if the frontend sent "data:audio/webm;base64,..."
    const cleanBase64 = audioBase64.includes(",")
      ? audioBase64.split(",")[1]
      : audioBase64;

    // Gemini strictly requires "audio/webm", not "audio/webm;codecs=opus"
    const cleanMimeType = mimeType.split(";")[0];

    // 1. Hardware/Mic Safety Guard: A real recording (>0.5s) is always >1,000 Base64 chars.
    if (cleanBase64.length < 1000) {
      return NextResponse.json({
        transcript: buildFallbackTranscript(context),
        source: "fallback_empty_or_short_audio",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        transcript: buildFallbackTranscript(context),
        source: "fallback_no_api_key",
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    // 2. Use temperature: 0 and structured JSON schema to prevent audio hallucinations
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          inlineData: {
            mimeType: cleanMimeType, // <-- Use the cleaned mimeType here
            data: cleanBase64,
          },
        },
        {
          text: "Listen to this audio clip. If clear human speech is present, set isSpeechDetected to true and transcribe the exact words into transcript. If the audio is silent, static, background noise, or unintelligible, set isSpeechDetected to false and set transcript to an empty string. Never guess or invent words.",
        },
      ],
      config: {
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isSpeechDetected: { type: Type.BOOLEAN },
            transcript: { type: Type.STRING },
          },
          required: ["isSpeechDetected", "transcript"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    const cleanTranscript = (parsed.transcript || "").trim();

    if (!parsed.isSpeechDetected || !cleanTranscript) {
      return NextResponse.json({
        transcript: buildFallbackTranscript(context),
        source: "fallback_silent_audio",
      });
    }

    return NextResponse.json({
      transcript: cleanTranscript,
      source: "gemini",
    });
  } catch (error) {
    console.error("Audio transcription fallback triggered:", error);
    return NextResponse.json({
      transcript: buildFallbackTranscript(fallbackContext),
      source: "fallback_error",
    });
  }
}