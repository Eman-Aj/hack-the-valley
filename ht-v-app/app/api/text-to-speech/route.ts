import { pcmToWav } from "@/lib/pcm-to-wav";
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { text } = body;

        if (typeof text !== "string" || text.trim().length === 0) {
            return NextResponse.json(
                { error: "Valid text is required" },
                { status: 400 }
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

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [
                {
                    parts: [{ text: text }],
                },
            ],
            config: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: {
                            voiceName: "Kore",
                        },
                    },
                },
            },
        });

        const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        
        if (!audioBase64) {
            return NextResponse.json(
                { error: "Failed to generate speech" },
                { status: 500 }
            );
        }

        const pcmBuffer = Buffer.from(audioBase64, "base64");
        const wavBuffer = pcmToWav(pcmBuffer);

        return new Response(new Uint8Array(wavBuffer), {
            headers: {
                "Content-Type": "audio/wav",
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