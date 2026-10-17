"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import type { MemoryEntry } from "../lib/types";
import { readSavedMemories } from "../lib/memory-storage";
import MemoryImageViewer from "./MemoryImageViewer";

type Memory = {
  title: string;
  date: string;
  story: string;
  art: string;
  questions: string[];
  id?: string;
  image?: string;
  verifiedMemory?: MemoryEntry;
};

const memories: Memory[] = [
  {
    title: "Meeting baby Theo",
    date: "June 2024",
    story: "This is your grandson Theo. You met him when he was just a few weeks old.",
    art: "senior-art-theo",
    questions: ["Who is this?", "Tell me about this day"],
  },
  {
    title: "Sunday dinner together",
    date: "October 2023",
    story: "Your family gathered for Sunday dinner. You always loved having everyone around the table.",
    art: "senior-art-dinner",
    questions: ["Who is at the table?", "What did I like to cook?"],
  },
  {
    title: "A summer day at the lake",
    date: "August 2022",
    story: "A warm summer afternoon spent by the water with your family.",
    art: "senior-art-lake",
    questions: ["Where am I?", "Who came with me?"],
  },
];

export default function SeniorMemories() {
  const [activeMemory, setActiveMemory] = useState<Memory | null>(null);
  const [familyMemories, setFamilyMemories] = useState<Memory[]>([]);
  const [imageRatios, setImageRatios] = useState<Record<string, number>>({});

  useEffect(() => {
    const refresh = () => setFamilyMemories(readSavedMemories().filter((entry) => entry.verificationStatus === "verified" && entry.sharingPermissions.visibleInAskMyStory).map((entry) => ({
      id: entry.id, title: entry.proposedCaption, date: entry.eventDate || "A family memory",
      story: entry.verifiedFacts.comfortingDetails || entry.familyStory, art: "", image: entry.image,
      questions: ["Who is this?", "Tell me about this day"], verifiedMemory: entry,
    })));
    refresh();
    window.addEventListener("memorylane:memories-updated", refresh);
    return () => window.removeEventListener("memorylane:memories-updated", refresh);
  }, []);
  const allMemories = [...familyMemories, ...memories];

  useEffect(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-memory-index]"));
    let frame = 0;
    const updateFocus = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const viewportCenter = window.innerHeight / 2;
        const travel = window.innerHeight * 1.35;
        for (const card of cards) {
          const bounds = card.getBoundingClientRect();
          const cardCenter = bounds.top + bounds.height / 2;
          const approach = Math.max(0, 1 - Math.abs(cardCenter - viewportCenter) / travel);
          const progress = approach * approach * (3 - 2 * approach);
          const visual = card.querySelector<HTMLElement>(".senior-memory-visual");
          const ratio = Number(visual?.dataset.aspectRatio) || 1.45;
          const maxHeight = Math.max(1, Math.min(window.innerHeight * 0.54, 580, card.clientWidth / ratio));
          const minHeight = Math.min(270, maxHeight);
          const imageHeight = minHeight + (maxHeight - minHeight) * progress;
          const imageWidth = imageHeight * ratio;
          card.style.setProperty("--memory-progress", progress.toFixed(3));
          visual?.style.setProperty("height", `${Math.round(imageHeight)}px`);
          visual?.style.setProperty("width", `${Math.round(imageWidth)}px`);
          card.classList.toggle("is-centered", progress >= 0.62);
        }
      });
    };
    updateFocus();
    window.addEventListener("scroll", updateFocus, { passive: true });
    window.addEventListener("resize", updateFocus);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", updateFocus); window.removeEventListener("resize", updateFocus); };
  }, [familyMemories, imageRatios]);

  return <section className={`senior-view ${activeMemory ? "has-active-memory" : ""}`}>
    {/* The senior view keeps one clear purpose: browse a memory or ask about it. */}
    <Link className="senior-exit-button" href="/">← Home</Link>
    <header className="senior-welcome">
      <div className="senior-welcome-icon" aria-hidden="true">♡</div>
      <div><div className="section-kicker">NANCY&apos;S MEMORY BOOK</div><h2>Hello, Nancy</h2><p>Choose a memory to look at. You can ask about any picture.</p></div>
      <Link href="/ask-story" className="senior-ask-story-link">Ask My Story <span aria-hidden="true">→</span></Link>
    </header>

    <div className="senior-layout">
      <div className="senior-memory-list">
        {allMemories.map((memory, index) => <article className={`senior-memory-card ${activeMemory?.title === memory.title ? "is-active" : ""}`} key={memory.id ?? memory.title} tabIndex={0} data-memory-index={index}>
          {/* A large picture placeholder leaves room for the real approved family photo. */}
          <div className="senior-memory-visual" data-aspect-ratio={imageRatios[memory.id ?? memory.title] ?? 1.45} style={{ "--memory-ratio": imageRatios[memory.id ?? memory.title] ?? 1.45 } as CSSProperties}>
            {memory.image ? <MemoryImageViewer src={memory.image} alt={memory.title} title={memory.title} imageClassName="senior-memory-image senior-memory-upload" variant="senior" onImageDimensions={(width, height) => { if (width && height) setImageRatios((current) => ({ ...current, [memory.id ?? memory.title]: width / height })); }}/> : <div className={`senior-memory-image ${memory.art}`} role="img" aria-label={`Photo placeholder: ${memory.title}`}>
              <span className="senior-sun"/><span className="senior-hill senior-hill-one"/><span className="senior-hill senior-hill-two"/>
              <span className="senior-photo-label">Family photo</span>
            </div>}
            <div className="senior-memory-caption"><strong>{memory.title}</strong><span>{memory.date}</span></div>
          </div>
          <div className="senior-memory-content">
            <div className="senior-memory-date">{memory.date}</div>
            <h3>{memory.title}</h3>
            <p>{memory.story}</p>
          </div>
          <button className="senior-ask-button" onClick={() => setActiveMemory(memory)}>
            <span className="senior-ask-icon" aria-hidden="true">?</span>
            Ask about this picture
            <span className="senior-button-arrow" aria-hidden="true">›</span>
          </button>
        </article>)}
      </div>

      {/* The side chat only appears after Nancy chooses a memory, so it has clear context. */}
      {activeMemory && <MemoryQuestionPanel key={activeMemory.id ?? activeMemory.title} memory={activeMemory} onClose={() => setActiveMemory(null)} />}
    </div>
    <div className="senior-end-note"><span aria-hidden="true">♡</span> More memories are waiting below. Keep scrolling when you&apos;re ready.</div>
    <div className="senior-family-link"><span>For Nancy&apos;s family</span><Link href="/family-memories">Add or review a memory →</Link></div>
  </section>;
}

function MemoryQuestionPanel({ memory, onClose }: { memory: Memory; onClose: () => void }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);

  async function askQuestion(value: string) {
    if (!value.trim()) return;
    setQuestion(value.trim()); setAnswer(""); setAsking(true);
    try {
      if (!memory.verifiedMemory) { setAnswer(memory.story); return; }
      const response = await fetch("/api/ask-story", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        residentPreferredName: "Nancy", question: value.trim(), verifiedMemories: [{
          id: memory.verifiedMemory.id, eventDate: memory.verifiedMemory.eventDate, contributorId: memory.verifiedMemory.contributorId,
          proposedCaption: memory.verifiedMemory.proposedCaption, familyStory: memory.verifiedMemory.familyStory, verifiedFacts: memory.verifiedMemory.verifiedFacts,
        }],
      }) });
      const data = await response.json(); setAnswer(data.result?.answer ?? memory.story);
    } catch { setAnswer(memory.story); }
    finally { setAsking(false); }
  }

  return <aside className="memory-chat-panel" aria-label="Ask about this memory">
    <div className="memory-chat-heading">
      <div className="memory-chat-icon" aria-hidden="true">?</div>
      <div><h3>Ask about this picture</h3><p>{memory.title}</p></div>
      <button className="memory-chat-close" aria-label="Close question panel" onClick={onClose}>×</button>
    </div>
    <div className="memory-chat-context">
      <span className="memory-chat-context-label">THIS MEMORY</span>
      <strong>{memory.title}</strong>
      <p>{memory.story}</p>
    </div>
    <div className="memory-chat-prompt">Try asking:</div>
    <div className="memory-chat-suggestions">
      {memory.questions.map((suggestion) => <button key={suggestion} onClick={() => askQuestion(suggestion)}>{suggestion}</button>)}
    </div>
    {answer && <div className="memory-chat-exchange" aria-live="polite">
      <div className="memory-chat-question"><span>You asked</span><p>{question}</p></div>
      <div className="memory-chat-answer"><span>From your family&apos;s memory</span><p>{answer}</p></div>
    </div>}
    {asking && <p className="memory-chat-note" role="status">Finding an answer from this memory…</p>}
    <form className="memory-chat-form" onSubmit={(event) => { event.preventDefault(); void askQuestion(question); }}>
      <label htmlFor="memory-question">Type a question about this picture</label>
      <div className="memory-chat-input-row">
        <input id="memory-question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Your question..." />
        <button type="submit" aria-label="Ask question" disabled={asking}>→</button>
      </div>
    </form>
    <p className="memory-chat-note">Answers use details Nancy&apos;s family has shared.</p>
  </aside>;
}
