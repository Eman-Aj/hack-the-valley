export function speakText(text: string) {
  if (typeof window === "undefined") return;

  const voices = window.speechSynthesis.getVoices();

  const zira = voices.find(voice =>
    voice.name.includes("Zira")
  );

  const message = new SpeechSynthesisUtterance(text);

  if (zira) {
    message.voice = zira;
  }

  message.rate = 0.85;
  message.pitch = 1.0;
  message.volume = 1.0;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(message);
}

export function stopSpeaking() {
  if (typeof window === "undefined") return;

  window.speechSynthesis.cancel();
}