"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { MOCK_MEMORIES } from "../lib/mock-db";
import { readSavedMemories } from "../lib/memory-storage";
import type { MemoryEntry } from "../lib/types";
import { recordQuestionActivity } from "../lib/question-activity";

export default function AskMyStory() {
  const [memories, setMemories] = useState<MemoryEntry[]>(MOCK_MEMORIES.filter((memory) => memory.residentId === "res_001" && memory.verificationStatus === "verified" && memory.sharingPermissions.visibleInAskMyStory));
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [supported, setSupported] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const refresh = () => setMemories([
      ...MOCK_MEMORIES.filter((memory) => memory.residentId === "res_001" && memory.verificationStatus === "verified" && memory.sharingPermissions.visibleInAskMyStory),
      ...readSavedMemories().filter((memory) => memory.residentId === "res_001" && memory.verificationStatus === "verified" && memory.sharingPermissions.visibleInAskMyStory),
    ]);
    refresh(); window.addEventListener("memorylane:memories-updated", refresh);
    return () => window.removeEventListener("memorylane:memories-updated", refresh);
  }, []);

  async function askQuestion(value: string) {
    const prompt = value.trim();
    if (!prompt) return;
    recordQuestionActivity("res_001");
    setQuestion(prompt); setAnswer(""); setError(""); setBusy(true); setSupported(null);
    try {
      const response = await fetch("/api/ask-story", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        residentPreferredName: "Nancy", question: prompt,
        verifiedMemories: memories.map((memory) => ({ id: memory.id, eventDate: memory.eventDate, contributorId: memory.contributorId, proposedCaption: memory.proposedCaption, familyStory: memory.familyStory, verifiedFacts: memory.verifiedFacts })),
      }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "We couldn't answer just now.");
      setAnswer(data.result.answer); setSupported(data.result.isSupported);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We couldn't answer just now. Please try again.");
    } finally { setBusy(false); }
  }

  function readAloud() {
    if (!answer || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel(); window.speechSynthesis.speak(new SpeechSynthesisUtterance(answer));
  }

  return <main className="senior-route ask-story-route"><div className="ask-story-page">
    <Link className="senior-exit-button" href="/memories">← Memory book</Link>
    <header className="senior-welcome"><div className="senior-welcome-icon" aria-hidden="true">?</div><div><div className="section-kicker">NANCY&apos;S FAMILY MEMORIES</div><h2>Ask My Story</h2><p>Ask a question. Answers come from memories your family confirmed.</p></div></header>
    <section className="panel ask-story-main">
      <div className="ask-story-records"><span className="section-kicker">CONFIRMED MEMORIES AVAILABLE</span><strong>{memories.length}</strong><span>Only verified memories shared with Nancy are used.</span></div>
      <div className="ask-story-suggestions"><span>Try asking:</span>{["Who is baby Theo?", "Where did Nancy meet Theo?", "What did the family say about that day?"].map((text) => <button type="button" key={text} disabled={busy} onClick={() => void askQuestion(text)}>{text}</button>)}</div>
      <form className="ask-story-form" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void askQuestion(question); }}><label htmlFor="ask-story-question">What would you like to know?</label><textarea id="ask-story-question" rows={3} value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Type a question about a family memory…"/><button className="button button-primary" type="submit" disabled={busy || !question.trim()}>{busy ? "Finding a family memory…" : "Ask about my memories"}</button></form>
      {busy && <p className="care-form-notice" role="status">This can take a little while. Your question is being checked against the confirmed family memories.</p>}
      {error && <p className="memory-form-message is-error" role="alert">{error}</p>}
      {answer && <article className={`ask-story-answer ${supported ? "answer-supported" : "answer-unknown"}`} aria-live="polite"><span className="section-kicker">{supported ? "FROM A CONFIRMED FAMILY MEMORY" : "NOT IN THE CONFIRMED MEMORIES"}</span><p>{answer}</p>{"speechSynthesis" in window && <button type="button" className="button button-outline" onClick={readAloud}>Read this aloud <span aria-hidden="true">🔊</span></button>}</article>}
      <p className="ask-story-safety">If your family has not confirmed an answer, Ask My Story will say it does not know.</p>
    </section>
    <Link className="ask-story-family-link" href="/family-memories">Family member: add or review Nancy&apos;s memories →</Link>
  </div></main>;
}
