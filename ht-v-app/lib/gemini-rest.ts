type GeminiPart = { text: string } | { inline_data: { mime_type: string; data: string } };
type GeminiSchema = Record<string, unknown>;

/** Calls Gemini's GenerateContent REST API so server routes don't depend on an SDK bundle. */
export async function generateGeminiJson(parts: GeminiPart[], responseSchema: GeminiSchema): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured on the server.");
  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema,
        // These draft and care requests are simple; avoid Gemini's slower default reasoning depth.
        thinkingConfig: { thinkingLevel: "low" },
      },
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error?.message;
    throw new Error(typeof message === "string" ? message : `Gemini request failed (${response.status}).`);
  }
  const text = data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? "").join("");
  if (!text) throw new Error("Gemini returned an empty response.");
  return text;
}
