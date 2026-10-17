"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

type SignalKey = "meals" | "mobility";

const signalDetails: Record<SignalKey, { title: string; summary: string; baseline: string; rule: string; observations: { date: string; value: string; note: string }[] }> = {
  meals: {
    title: "Meal intake",
    summary: "Recorded intake has been below Nancy's usual range for four days.",
    baseline: "Nancy's usual recorded intake is 75–100% of meals.",
    rule: "Demonstration rule: flag for human review when intake is below 60% for 3 or more consecutive recorded days.",
    observations: [
      { date: "Oct 14 · Breakfast", value: "45%", note: "Ate some toast and tea." },
      { date: "Oct 15 · Lunch", value: "35%", note: "Declined the rest of lunch." },
      { date: "Oct 16 · Dinner", value: "40%", note: "Ate about half of the meal." },
      { date: "Oct 17 · Breakfast", value: "32%", note: "Had tea and a few bites." },
    ],
  },
  mobility: {
    title: "Mobility assistance",
    summary: "More hands-on assistance was recorded in three of the last five visits.",
    baseline: "Nancy's usual assistance level is 0–1 on the demo 0–3 scale.",
    rule: "Demonstration rule: flag for human review when assistance level 2 or higher is recorded in 3 or more of the last 5 visits.",
    observations: [
      { date: "Oct 13 · Morning visit", value: "Level 2", note: "Steadying support while standing." },
      { date: "Oct 15 · Afternoon visit", value: "Level 2", note: "One-person hands-on support." },
      { date: "Oct 17 · Morning visit", value: "Level 3", note: "More hands-on help than usual." },
    ],
  },
};

export default function CareBrief() {
  const [activeSignal, setActiveSignal] = useState<SignalKey | null>(null);

  return <>
    <div className="page-heading-row"><div><div className="section-kicker">HANDOFF OVERVIEW</div><h2>Today&apos;s care brief</h2><p className="lead">A thoughtful start to Nancy&apos;s next visit.</p></div><span className="tag tag-green">FICTIONAL DEMO DATA</span></div>

    {/* Signals request qualified human review; they are not diagnoses or predictions. */}
    <section className="review-banner">
      <div className="review-icon">!</div>
      <div className="review-copy"><div className="review-title">Review suggested <span className="tag tag-amber">HUMAN REVIEW</span></div><p>Recent meal intake and mobility observations differ from Nancy&apos;s recorded baseline.</p></div>
      <a className="text-link" href="#baseline">View details <span>→</span></a>
    </section>

    <div className="brief-grid">
      <div className="primary-column">
        <section className="panel context-panel">
          <div className="panel-heading"><div><div className="section-kicker">KNOW THE PERSON</div><h3>Personal context</h3></div><span className="tag tag-green"><span className="tiny-check">✓</span> VERIFIED</span></div>
          <div className="memory-highlight">
            <div className="memory-art" aria-label="Illustration placeholder for a family photo" role="img"><span className="sun"/><span className="hill hill-one"/><span className="hill hill-two"/><span className="photo-caption">A family moment</span></div>
            <div className="memory-copy"><div className="memory-date">FAMILY MEMORY <span>·</span> JUNE 14, 2024</div><h4>The day Nancy met Theo</h4><p>Nancy&apos;s grandson Theo was just a few weeks old. She loves telling people about the day they met.</p><div className="source-line"><span className="source-avatar">JW</span> Shared by Jordan, her son</div></div>
          </div>
          <Link className="button button-text" href="/family-memories">Review family memories <span>→</span></Link>
        </section>

        <CareNotes />
      </div>

      <div className="secondary-column">
        <section className="panel change-panel" id="baseline"><div className="panel-heading"><div><div className="section-kicker">BASELINE COMPARISON</div><h3>What&apos;s changed</h3></div><span className="change-icon">↗</span></div>
          <button className="change-item change-item-button" onClick={() => setActiveSignal("meals")}><span className="change-symbol meal-symbol">⌁</span><span className="change-item-copy"><strong>Meal intake</strong><span className="change-description">Lower than usual for 4 consecutive days</span><span className="change-meta">Usual: 75–100% <b>·</b> Recent: 32–45%</span></span><span className="detail-chevron">›</span></button>
          <button className="change-item change-item-button" onClick={() => setActiveSignal("mobility")}><span className="change-symbol mobility-symbol">↗</span><span className="change-item-copy"><strong>Mobility assistance</strong><span className="change-description">More support noted during recent visits</span><span className="change-meta">3 observations <b>·</b> Past 5 visits</span></span><span className="detail-chevron">›</span></button>
          <div className="rule-note"><span>ⓘ</span> Demo rules only. They are not clinically validated thresholds.</div>
        </section>
      </div>
    </div>

    {activeSignal && <SignalDetails signal={signalDetails[activeSignal]} onClose={() => setActiveSignal(null)} />}
  </>;
}

function CareNotes() {
  const [tab, setTab] = useState<"handoff" | "activities">("handoff");
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState([
    { category: "handoff" as const, date: "Today · 9:20 AM", author: "Maya · Care partner", text: "Nancy seemed more comfortable after sitting by the window for a while. She enjoys a quiet start to the morning." },
    { category: "activities" as const, date: "Yesterday · 2:10 PM", author: "Maya · Care partner", text: "Listened to her favorite jazz playlist and looked through the garden photos together. Nancy smiled and hummed along." },
    { category: "handoff" as const, date: "Oct 15 · 11:40 AM", author: "Sam · Care partner", text: "Her blue cardigan was in the closet by the front door. She asked for it before going out." },
  ]);

  const visibleNotes = notes.filter((note) => note.category === tab);

  function saveNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!noteText.trim()) return;
    setNotes([{ category: tab, date: "Just now", author: "You · Care team", text: noteText.trim() }, ...notes]);
    setNoteText("");
  }

  return <section className="panel caregiver-notes">
    <div className="panel-heading"><div><div className="section-kicker">SHARED CARE TEAM NOTES</div><h3>Helpful for the next visit</h3></div><span className="notes-count">{visibleNotes.length} notes</span></div>
    <div className="notes-tabs" role="tablist" aria-label="Caregiver note categories">
      <button role="tab" aria-selected={tab === "handoff"} className={tab === "handoff" ? "selected" : ""} onClick={() => setTab("handoff")}>Handoff notes</button>
      <button role="tab" aria-selected={tab === "activities"} className={tab === "activities" ? "selected" : ""} onClick={() => setTab("activities")}>Activities</button>
    </div>
    <div className="care-notes-list">
      {visibleNotes.map((note, index) => <article className="care-note" key={`${note.date}-${index}`}><div className="care-note-meta"><strong>{note.author}</strong><span>{note.date}</span></div><p>{note.text}</p></article>)}
    </div>
    <form className="add-care-note" onSubmit={saveNote}>
      <label htmlFor="care-note-input">Add a {tab === "handoff" ? "handoff note" : "recent activity"}</label>
      <textarea id="care-note-input" rows={2} value={noteText} onChange={(event) => setNoteText(event.target.value)} placeholder={tab === "handoff" ? "Share something useful for the next caregiver..." : "What did Nancy do today? How did it go?"}/>
      <div className="notes-form-footer"><span>Shared with Nancy&apos;s care team</span><button className="button button-primary" type="submit">Add note <span>→</span></button></div>
    </form>
  </section>;
}

function SignalDetails({ signal, onClose }: { signal: (typeof signalDetails)[SignalKey]; onClose: () => void }) {
  return <div className="signal-modal-backdrop" onClick={onClose}>
    <section className="signal-modal" role="dialog" aria-modal="true" aria-labelledby="signal-modal-title" onClick={(event) => event.stopPropagation()}>
      <div className="signal-modal-heading"><div><div className="section-kicker">WHY THIS WAS FLAGGED</div><h3 id="signal-modal-title">{signal.title}</h3></div><button className="signal-modal-close" aria-label="Close details" onClick={onClose}>×</button></div>
      <p className="signal-modal-summary">{signal.summary}</p>
      <div className="signal-baseline-box"><strong>Usual baseline</strong><p>{signal.baseline}</p></div>
      <h4>Supporting observations</h4>
      <ul className="signal-observation-list">{signal.observations.map((observation) => <li key={observation.date}><span className="signal-observation-date">{observation.date}</span><strong>{observation.value}</strong><span>{observation.note}</span></li>)}</ul>
      <div className="signal-rule-box"><strong>Demo review rule</strong><p>{signal.rule}</p></div>
      <p className="signal-modal-disclaimer">This is a demonstration signal for human review, not a diagnosis or clinical recommendation.</p>
      <button className="button button-primary signal-done-button" onClick={onClose}>Done</button>
    </section>
  </div>;
}
