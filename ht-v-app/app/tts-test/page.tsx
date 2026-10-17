"use client";

import { useState } from "react";
import { speakText, stopSpeaking } from "@/lib/text-to-speech";

export default function TTSTestPage() {
  const [loading, setLoading] = useState(false);

  const testText =
    "Hello! Welcome to your Care Brief. I'm here to help you understand your health information.";

  async function handlePlay() {
    setLoading(true);
    try {
      await speakText(testText);
    } finally {
      setLoading(false);
    }
  }

  function handleStop() {
    stopSpeaking();
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-bold">
        Gemini Text-to-Speech Test
      </h1>

      <p className="max-w-md text-center">{testText}</p>

      <div className="flex gap-4">
        <button
          onClick={handlePlay}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-6 py-3 text-white disabled:opacity-50"
        >
          {loading ? "Generating audio..." : "Play Audio"}
        </button>

        <button
          onClick={handleStop}
          className="rounded-lg bg-red-600 px-6 py-3 text-white"
        >
          Stop Audio
        </button>
      </div>
    </main>
  );
}
