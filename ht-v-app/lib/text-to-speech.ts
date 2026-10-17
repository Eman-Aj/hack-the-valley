
let currentAudio: HTMLAudioElement | null = null;
let currentAudioUrl: string | null = null;
let requestController: AbortController | null = null;

export async function speakText(text: string): Promise<void> {
  if (typeof window === "undefined") return;

  stopSpeaking();

  const controller = new AbortController();
  requestController = controller;

  try {
    const response = await fetch("/api/text-to-speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error("Failed to generate speech");
    }

    const audioBlob = await response.blob();

    if (controller.signal.aborted) return;

    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    currentAudio = audio;
    currentAudioUrl = audioUrl;

    audio.onended = () => {
      if (currentAudio === audio) stopSpeaking();
    };

    await audio.play();
  } catch (error) {
    if (!controller.signal.aborted) {
      console.error("Gemini text-to-speech error:", error);
      if (requestController === controller) stopSpeaking();
    }
  }
}

export function stopSpeaking(): void {
  requestController?.abort();
  requestController = null;

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  if (currentAudioUrl) {
    URL.revokeObjectURL(currentAudioUrl);
    currentAudioUrl = null;
  }
}
