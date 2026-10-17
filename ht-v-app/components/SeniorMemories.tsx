"use client";

import { useState } from "react";

type Memory = {
  title: string;
  date: string;
  story: string;
  art: string;
  questions: string[];
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

export default function SeniorMemories({ onExit }: { onExit: () => void }) {
  const [activeMemory, setActiveMemory] = useState<Memory | null>(null);

  return <section className={`senior-view ${activeMemory ? "has-active-memory" : ""}`}>
    {/* The senior view keeps one clear purpose: browse a memory or ask about it. */}
    <button className="senior-exit-button" onClick={onExit}>← Exit memory book</button>
    <header className="senior-welcome">
      <div className="senior-welcome-icon" aria-hidden="true">♡</div>
      <div><div className="section-kicker">NANCY&apos;S MEMORY BOOK</div><h2>Hello, Nancy</h2><p>Choose a memory to look at. You can ask about any picture.</p></div>
    </header>

    <div className="senior-layout">
      <div className="senior-memory-list">
        {memories.map((memory) => <article className={`senior-memory-card ${activeMemory?.title === memory.title ? "is-active" : ""}`} key={memory.title}>
          {/* A large picture placeholder leaves room for the real approved family photo. */}
          <div className={`senior-memory-image ${memory.art}`} role="img" aria-label={`Photo placeholder: ${memory.title}`}>
            <span className="senior-sun"/><span className="senior-hill senior-hill-one"/><span className="senior-hill senior-hill-two"/>
            <span className="senior-photo-label">Family photo</span>
          </div>
          <div className="senior-memory-content">
            <div className="senior-memory-date">{memory.date}</div>
            <h3>{memory.title}</h3>
            <p>{memory.story}</p>
            <button className="senior-ask-button" onClick={() => setActiveMemory(memory)}>
              <span className="senior-ask-icon" aria-hidden="true">?</span>
              Ask about this picture
              <span className="senior-button-arrow" aria-hidden="true">›</span>
            </button>
          </div>
        </article>)}
      </div>

      {/* The side chat only appears after Nancy chooses a memory, so it has clear context. */}
      {activeMemory && <MemoryQuestionPanel key={activeMemory.title} memory={activeMemory} onClose={() => setActiveMemory(null)} />}
    </div>
    <div className="senior-end-note"><span aria-hidden="true">♡</span> More memories are waiting below. Keep scrolling when you&apos;re ready.</div>
  </section>;
}

function MemoryQuestionPanel({ memory, onClose }: { memory: Memory; onClose: () => void }) {
  const [question, setQuestion] = useState("");
  const [answerVisible, setAnswerVisible] = useState(false);

  function askQuestion(value: string) {
    if (!value.trim()) return;
    setQuestion(value.trim());
    setAnswerVisible(true);
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
    {answerVisible && <div className="memory-chat-exchange" aria-live="polite">
      <div className="memory-chat-question"><span>You asked</span><p>{question}</p></div>
      <div className="memory-chat-answer"><span>From your family&apos;s memory</span><p>{memory.story}</p></div>
    </div>}
    <form className="memory-chat-form" onSubmit={(event) => { event.preventDefault(); askQuestion(question); }}>
      <label htmlFor="memory-question">Type a question about this picture</label>
      <div className="memory-chat-input-row">
        <input id="memory-question" value={question} onChange={(event) => { setQuestion(event.target.value); setAnswerVisible(false); }} placeholder="Your question..." />
        <button type="submit" aria-label="Ask question">→</button>
      </div>
    </form>
    <p className="memory-chat-note">Answers use details Nancy&apos;s family has shared.</p>
  </aside>;
}
