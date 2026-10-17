import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const text = body && typeof body === "object" ? body.text : undefined;

        if (typeof text !== "string" || text.trim().length === 0 || text.length > 5000) {
            return NextResponse.json(
                { error: "Text between 1 and 5,000 characters is required" },
                { status: 400 },
            );
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: "Gemini API key is missing" },
                { status: 500 }
            );
        }

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });

        const response = await ai.interactions.create({
            model: "gemini-3.8-flash-lite-tts",
            input: [{
                type: "user_input",
                content: [{
                    type: "text",
                    text: text.trim(),
                    annotations: [{
                        type: "speech_metadata",
                        style: "Warm, calm, clear narration at a gentle pace for an older adult listener.",
                    }],
                }],
            }],
            response_format: { type: "audio" },
            generation_config: {
                speech_config: [{ voice: "Kore" }],
            },
        });

        const audioBase64 = response.output_audio?.data;
        
        if (!audioBase64) {
            return NextResponse.json(
                { error: "Failed to generate speech" },
                { status: 500 }
            );
        }

        // Unary Gemini 3.8 TTS returns a complete WAV file, including its header.
        const wavBuffer = Buffer.from(audioBase64, "base64");

        return new Response(new Uint8Array(wavBuffer), {
            headers: {
                "Content-Type": "audio/wav",
                "Cache-Control": "no-store",
            },
        });

    } catch (error) {
        console.error("Text-to-speech error:", error);

        return NextResponse.json(
            { error: "Failed to generate speech" },
            { status: 500 }
        );
    }
}
