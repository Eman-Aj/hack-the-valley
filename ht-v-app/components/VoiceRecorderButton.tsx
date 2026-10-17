"use client";

import { useState, useRef } from "react";

interface VoiceRecorderButtonProps {
  context?: "ask_story" | "family_memory" | "memory_question";
  onTranscriptReady: (transcript: string) => void;
}

export default function VoiceRecorderButton({
  context = "ask_story",
  onTranscriptReady,
}: VoiceRecorderButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [message, setMessage] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const sendToBackend = async (base64Audio: string, mimeType: string) => {
    setIsTranscribing(true);
    setMessage("");
    try {
      const res = await fetch("/api/transcribe-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioBase64: base64Audio,
          mimeType,
          context,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transcription failed. Please try again.");
      if (data.transcript) {
        onTranscriptReady(data.transcript);
        setMessage("Question transcribed. Review it, then send.");
      } else {
        setMessage("We didn’t hear a clear question. Please try speaking again.");
      }
    } catch (err) {
      console.error("Transcription request failed:", err);
      setMessage(err instanceof Error ? err.message : "Transcription failed. Please try again.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const startRecording = async () => {
    setMessage("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setMessage("This browser can’t record audio. Please type your question instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          sendToBackend(base64data, mimeType);
        };
        reader.readAsDataURL(blob);

        // Stop microphone tracks so the browser recording dot turns off
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      if (context === "memory_question") {
        setMessage("Microphone access is unavailable. Please allow microphone access or type your question.");
        return;
      }
      console.warn("Mic permission blocked or unavailable; using demo fallback:", err);
      // Demo safety: if mic is blocked on stage, still trigger backend fallback!
      await sendToBackend("FALLBACK_TRIGGER", "audio/webm");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const memoryQuestion = context === "memory_question";
  return <div className={`voice-recorder-control ${memoryQuestion ? "voice-recorder-memory-question" : ""}`}>
    <button
      type="button"
      onClick={isRecording ? stopRecording : startRecording}
      disabled={isTranscribing}
      aria-label={isTranscribing ? "Transcribing your question" : isRecording ? "Stop recording" : "Ask by voice"}
      className={`voice-recorder-button ${isRecording ? "is-recording" : ""} ${isTranscribing ? "is-transcribing" : ""} px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition ${
        isRecording
          ? "bg-red-600 text-white animate-pulse"
          : "bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50"
      }`}
    >
      {isTranscribing ? "⏳ Transcribing..." : isRecording ? "⏹️ Stop recording" : memoryQuestion ? "🎤 Ask by voice" : "🎤 Speak"}
    </button>
    {message && <span className="voice-recorder-message" role="status">{message}</span>}
  </div>;
}
