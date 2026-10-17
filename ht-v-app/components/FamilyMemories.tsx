"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import type { DraftMemoryOutput } from "../lib/validation";
import type { MemoryEntry } from "../lib/types";
import { readSavedMemories, saveMemory } from "../lib/memory-storage";
import { MOCK_MEMORIES } from "../lib/mock-db";
import MemoryImageViewer from "./MemoryImageViewer";

export default function FamilyMemories() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [story, setStory] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [draft, setDraft] = useState<DraftMemoryOutput | null>(null);
  const [source, setSource] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<MemoryEntry[]>([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const refresh = () => setSaved(readSavedMemories());
    refresh();
    window.addEventListener("memorylane:memories-updated", refresh);
    return () => window.removeEventListener("memorylane:memories-updated", refresh);
  }, []);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(""); setDraft(null); setConfirmed(false);
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { setError("Please choose a JPG, PNG, or WebP photo."); event.target.value = ""; return; }
    if (file.size > 10 * 1024 * 1024) { setError("This photo is over 10 MB. Please choose a smaller image."); event.target.value = ""; return; }
    try {
      // Resize/re-encode before sending and saving so the demo stays comfortably within browser limits.
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      const optimized = canvas.toDataURL("image/jpeg", 0.76);
      setImage(optimized); setFileName(file.name);
    } catch {
      setError("We couldn't open that photo. Please try another JPG, PNG, or WebP image.");
    }
  }

  async function generateDraft() {
    if (!story.trim()) { setError("Add a short family story first."); return; }
    setBusy(true); setError(""); setNotice(""); setConfirmed(false);
    try {
      const response = await fetch("/api/draft-memory", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familyStory: story.trim(), contributorName: "Jordan Wilson", eventDateHint: eventDate.trim(), imageBase64: image ?? undefined }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "We couldn't create a draft right now.");
      setDraft(data.draft); setSource(data.source ?? "AI draft");
      if (typeof data.durationMs === "number") setNotice(`Draft ready in ${(data.durationMs / 1000).toFixed(1)} seconds. Please review every detail.`);
    } catch (err) {
      // Keep the flow usable without an AI key: the family can still write and verify a memory themselves.
      setDraft({ proposedCaption: story.trim(), suggestedEventDate: eventDate.trim(), people: [], locationOrContext: "", comfortingDetails: "", needsConfirmationNotes: ["AI drafting was unavailable. Please check every detail and add any helpful context before saving."] });
      setSource("manual review");
      setNotice(`${err instanceof Error ? err.message : "AI drafting is unavailable."} A manual draft is ready for you to review.`);
    } finally { setBusy(false); }
  }

  function updateDraft<K extends keyof DraftMemoryOutput>(key: K, value: DraftMemoryOutput[K]) {
    if (draft) setDraft({ ...draft, [key]: value });
    setConfirmed(false);
  }

  function confirmMemory() {
    if (!draft || !confirmed) return;
    const entry: MemoryEntry = {
      id: `mem_${Date.now()}`, residentId: "res_001", createdAt: new Date().toISOString(),
      eventDate: draft.suggestedEventDate || eventDate, image: image ?? undefined,
      familyStory: story.trim(), proposedCaption: draft.proposedCaption.trim(),
      verifiedFacts: { people: draft.people, eventDate: draft.suggestedEventDate || eventDate, locationOrContext: draft.locationOrContext, comfortingDetails: draft.comfortingDetails },
      verificationStatus: "verified", contributorId: "Jordan Wilson",
      sharingPermissions: { visibleInAskMyStory: true, includeInCareBrief: true },
    };
    try {
      saveMemory(entry); setSaved(readSavedMemories()); setError(""); setNotice("Saved to Nancy's memory book. This browser now has the confirmed memory.");
      setImage(null); setFileName(""); setStory(""); setEventDate(""); setDraft(null); setConfirmed(false);
      if (fileInput.current) fileInput.current.value = "";
    } catch {
      setError("The browser couldn't save this photo. Try a smaller image or use a different browser.");
    }
  }

  return <>
    <div className="page-heading-row"><div><div className="section-kicker">FAMILY & CARE PARTNER WORKSPACE</div><h2>Add and manage memories</h2><p className="lead">Share a story for Nancy to revisit. Review details before they appear in her memories.</p></div><button className="button button-primary memory-upload-cta" onClick={() => fileInput.current?.click()}>↑ Upload a photo</button></div>
    <section className="panel add-memory-panel">
      <div className="add-memory-intro"><div className="upload-icon">＋</div><div><h3>Add a family memory</h3><p>Share a photo and the story behind it. You&apos;ll review every detail before it becomes part of Nancy&apos;s story.</p></div></div>
      <div className="upload-drop" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file && fileInput.current) { const transfer = new DataTransfer(); transfer.items.add(file); fileInput.current.files = transfer.files; fileInput.current.dispatchEvent(new Event("change", { bubbles: true })); } }}>
        {image ? <img className="memory-upload-preview" src={image} alt="Selected family memory"/> : <div className="upload-cloud">↑</div>}
        <strong>{fileName || "Choose a photo to get started"}</strong><span>JPG, PNG, or WebP · up to 10 MB</span>
        <input ref={fileInput} id="memory-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} hidden />
        <button type="button" className="button button-outline" onClick={() => fileInput.current?.click()}>{image ? "Change photo" : "Choose photo"}</button>
      </div>
      <div className="form-grid"><div className="form-field"><label htmlFor="memory-story">Your story</label><textarea id="memory-story" rows={3} value={story} onChange={(e) => setStory(e.target.value)} placeholder="What would you like Nancy to remember about this moment?"/></div><div className="form-field"><label htmlFor="memory-date">When did this happen?</label><input id="memory-date" type="text" value={eventDate} onChange={(e) => setEventDate(e.target.value)} placeholder="e.g. Summer 2024"/><p className="form-help">Only include names, dates, and relationships that your family knows.</p></div></div>
      <div className="ai-draft-note"><span>✦</span><p><strong>Review before saving</strong><br/>AI can suggest a caption and visible context. It cannot identify people in a photo. Nothing is shared until you confirm the details.</p><button type="button" className="button button-soft" disabled={busy} onClick={generateDraft}>{busy ? "Preparing…" : "Create review draft"}</button></div>
      {error && <p className="memory-form-message is-error" role="alert">{error}</p>}{notice && <p className="memory-form-message is-success" role="status">{notice}</p>}
      {draft && <section className="memory-draft-review" aria-labelledby="draft-title"><div className="draft-review-heading"><div><div className="section-kicker">{source.replaceAll("_", " ")}</div><h3 id="draft-title">Review this memory</h3></div><span className="tag tag-pending">DRAFT</span></div>
        <div className="form-grid"><div className="form-field"><label htmlFor="draft-caption">Suggested caption</label><textarea id="draft-caption" rows={2} value={draft.proposedCaption} onChange={(e) => updateDraft("proposedCaption", e.target.value)}/></div><div className="form-field"><label htmlFor="draft-date">Date</label><input id="draft-date" value={draft.suggestedEventDate} onChange={(e) => updateDraft("suggestedEventDate", e.target.value)} placeholder="Confirm or add a date"/><label htmlFor="draft-context">Place or context</label><input id="draft-context" value={draft.locationOrContext} onChange={(e) => updateDraft("locationOrContext", e.target.value)} placeholder="Add only what you know"/></div></div>
        <div className="form-field draft-comfort"><label htmlFor="draft-comforting">Helpful details</label><textarea id="draft-comforting" rows={2} value={draft.comfortingDetails} onChange={(e) => updateDraft("comfortingDetails", e.target.value)} placeholder="A detail that may feel familiar or comforting"/></div>
        {draft.needsConfirmationNotes.length > 0 && <ul className="draft-confirmation-notes">{draft.needsConfirmationNotes.map((note, index) => <li key={index}>{note}</li>)}</ul>}
        <label className="memory-confirm-check"><input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)}/><span>I reviewed this memory and confirm these details are accurate.</span></label>
        <button className="button button-primary" disabled={!confirmed} onClick={confirmMemory}>Save confirmed memory</button>
      </section>}
    </section>
    <div className="gallery-heading"><div><div className="section-kicker">NANCY&apos;S STORY</div><h3>Memory collection <span className="count-pill">{MOCK_MEMORIES.filter((memory) => memory.residentId === "res_001").length + saved.length}</span></h3></div><span className="small-select">All memories</span></div>
    <div className="memory-grid">{[...MOCK_MEMORIES.filter((memory) => memory.residentId === "res_001"), ...saved.filter((memory) => memory.residentId === "res_001")].map((memory) => <MemoryRecordCard key={memory.id} memory={memory}/>)}</div>
  </>;
}

function MemoryRecordCard({ memory }: { memory: MemoryEntry }) {
  const verified = memory.verificationStatus === "verified";
  const people = memory.verifiedFacts.people.map((person) => `${person.name} (${person.relationship})`).join(" · ");
  return <article className="panel memory-card">
    {memory.image ? <MemoryImageViewer src={memory.image} alt={memory.proposedCaption} title={memory.proposedCaption} imageClassName="memory-card-photo"/> : <div className="memory-art card-art" role="img" aria-label="Photo not available; neutral placeholder shown"><span className="photo-caption">Photo not available</span></div>}
    <div className="memory-card-body"><div className="memory-card-meta"><span>{memory.eventDate || "Date not added"}</span><span className={`tag tag-${verified ? "verified" : "pending"}`}>{verified ? "✓ Verified" : "Draft for review"}</span></div>
      <h4>{memory.proposedCaption}</h4><p>{memory.familyStory}</p><p className="memory-record-facts"><strong>Confirmed:</strong> {people || "No people or relationships confirmed"}<br/><strong>Context:</strong> {memory.verifiedFacts.locationOrContext || "Not recorded"}</p>
      <div className="source-line"><span className="source-avatar">{memory.contributorId.slice(0, 1)}</span> Shared by {memory.contributorId} · Event date {memory.verifiedFacts.eventDate || "not specified"}</div>
      <div className="memory-permission-list"><span>{memory.sharingPermissions.visibleInAskMyStory ? "✓ Ask My Story" : "— Ask My Story"}</span><span>{memory.sharingPermissions.includeInCareBrief ? "✓ Care brief" : "— Care brief"}</span></div>
    </div>
  </article>;
}
