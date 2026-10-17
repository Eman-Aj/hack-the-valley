"use client";

import { useState } from "react";
import VoiceRecorderButton from "../../components/VoiceRecorderButton";

export default function TestVoicePage() {
  const [transcript, setTranscript] = useState<string>("");

  return (
    <div className="p-10 max-w-xl mx-auto space-y-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold">Live Microphone Test</h1>
      
      <VoiceRecorderButton 
        context="ask_story" 
        onTranscriptReady={(text) => setTranscript(text)} 
      />

      <div className="w-full p-4 min-h-[100px] border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center text-center">
        {transcript ? (
          <p className="text-lg text-green-700 font-medium">"{transcript}"</p>
        ) : (
          <p className="text-gray-400">Your transcribed words will appear here...</p>
        )}
      </div>
    </div>
  );
}