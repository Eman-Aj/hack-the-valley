"use client";

import { useState, type FormEvent } from "react";
import { addNursingNote } from "../lib/care-demo-storage";
import { CARE_ROLE_LABELS } from "../lib/care-role-labels";
import type { CareTeamRole, NursingNote, NursingNoteCategory, Resident } from "../lib/types";

const categoryLabels: Record<NursingNoteCategory, string> = {
  cognition_orientation: "Cognition & orientation",
  communication: "Communication",
  mood_behavior: "Mood & behavior",
  personal_care: "Personal care",
  safety: "Safety & environment",
  other: "Other observation",
};

const dateTime = (value: string) =>
  new Date(value).toLocaleString("en-CA", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export default function ResidentNursingNotes({
  resident,
  notes,
  compact = false,
  limit,
  allowEntry = false,
}: {
  resident: Resident;
  notes: NursingNote[];
  compact?: boolean;
  limit?: number;
  allowEntry?: boolean;
}) {
  const [category, setCategory] = useState<NursingNoteCategory>("cognition_orientation");
  const [note, setNote] = useState("");
  const [recordedBy, setRecordedBy] = useState("Maya Chen");
  const [recordedByRole, setRecordedByRole] = useState<CareTeamRole>("nurse");
  const [notice, setNotice] = useState("");
  const visibleNotes = limit === undefined ? notes : notes.slice(0, limit);

  function submitNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    if (!recordedBy.trim() || !note.trim()) {
      setNotice("Enter the caregiver's name and an observation before saving.");
      return;
    }

    try {
      addNursingNote({
        id: `nursing_${resident.id}_${Date.now()}`,
        residentId: resident.id,
        recordedAt: new Date().toISOString(),
        category,
        note: note.trim(),
        recordedBy: recordedBy.trim(),
        recordedByRole,
      });
      setNote("");
      setNotice("Nursing note saved separately from meal, mobility, and sleep observations.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to save the nursing note.");
    }
  }

  return (
    <section className={`resident-nursing-notes${compact ? " is-compact" : ""}`} aria-labelledby={`nursing-notes-${resident.id}`}>
      <div className="nursing-notes-heading">
        <div>
          <div className="section-kicker">HOLISTIC CARE · SEPARATE FROM SIGNALS</div>
          <h3 id={`nursing-notes-${resident.id}`}>Dementia-focused nursing notes</h3>
        </div>
        <span className="nursing-note-count">{notes.length} notes</span>
      </div>
      {!compact && <p className="nursing-notes-intro">Record what you observed, what support was offered, and how the resident responded. These notes do not change meal, mobility, or sleep signals and are not a diagnosis.</p>}
      {visibleNotes.length ? (
        <div className="nursing-note-list">
          {visibleNotes.map((item) => (
            <article className="nursing-note-card" key={item.id}>
              <div className="nursing-note-meta">
                <span className="nursing-note-category">{categoryLabels[item.category]}</span>
                <time dateTime={item.recordedAt}>{dateTime(item.recordedAt)}</time>
              </div>
              <p>{item.note}</p>
              <small>Recorded by {item.recordedBy}, {CARE_ROLE_LABELS[item.recordedByRole]}</small>
            </article>
          ))}
        </div>
      ) : <p className="nursing-notes-empty">No nursing notes recorded yet.</p>}
      {allowEntry && (
        <form className="nursing-note-form" onSubmit={submitNote}>
          <h4>Add a nursing note</h4>
          <p>Use neutral, specific language. Include context, an action or support offered, and the observed response when relevant.</p>
          <label>Observation area
            <select value={category} onChange={(event) => setCategory(event.target.value as NursingNoteCategory)}>
              {Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label>Caregiver name<input value={recordedBy} onChange={(event) => setRecordedBy(event.target.value)} required/></label>
          <label>Caregiver title
            <select value={recordedByRole} onChange={(event) => setRecordedByRole(event.target.value as CareTeamRole)}>
              {Object.entries(CARE_ROLE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="nursing-note-text-field">Nursing note
            <textarea rows={4} maxLength={1200} value={note} onChange={(event) => setNote(event.target.value)} placeholder="What happened? What did you observe, offer, or try? How did the resident respond?" required/>
          </label>
          <button className="button button-primary" type="submit">Save nursing note</button>
          {notice && <p className="care-form-notice nursing-note-notice" role="status">{notice}</p>}
        </form>
      )}
    </section>
  );
}
