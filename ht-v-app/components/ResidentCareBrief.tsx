"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { MOCK_MEMORIES, MOCK_OBSERVATIONS } from "../lib/mock-db";
import { evaluateHealthSignals } from "../lib/signal-engine";
import { addHandoff, readCareObservations, readHandoffs } from "../lib/care-demo-storage";
import { readSavedMemories } from "../lib/memory-storage";
import type { CareObservation, InteractionOutcome, MemoryEntry, Resident } from "../lib/types";

const humanDate = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
const valueText = (observation: CareObservation) => observation.type === "meal_intake" ? `${observation.value}% meal intake` : observation.type === "mobility_assistance" ? `Mobility assistance level ${observation.value}/3` : `Sleep disruption level ${observation.value}/5`;
const baselineText = (observation: CareObservation, resident: Resident) => observation.type === "meal_intake" ? `${resident.baseline[observation.type]}%` : `Level ${resident.baseline[observation.type]}/${observation.type === "mobility_assistance" ? 3 : 5}`;

export default function ResidentCareBrief({ resident }: { resident: Resident }) {
  const [observations, setObservations] = useState<CareObservation[]>(MOCK_OBSERVATIONS);
  const [memories, setMemories] = useState<MemoryEntry[]>(MOCK_MEMORIES);
  const [handoffs, setHandoffs] = useState<InteractionOutcome[]>([]);
  const [caregiver, setCaregiver] = useState("Maya Chen");
  const [selectedMemoryId, setSelectedMemoryId] = useState("");
  const [action, setAction] = useState("");
  const [response, setResponse] = useState("");
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const refresh = () => {
      setObservations(readCareObservations());
      setMemories([...MOCK_MEMORIES, ...readSavedMemories()]);
      setHandoffs(readHandoffs());
    };
    refresh(); window.addEventListener("memorylane:care-data-updated", refresh); window.addEventListener("memorylane:memories-updated", refresh);
    return () => { window.removeEventListener("memorylane:care-data-updated", refresh); window.removeEventListener("memorylane:memories-updated", refresh); };
  }, []);

  const residentMemories = useMemo(() => memories.filter((memory) => memory.residentId === resident.id && memory.verificationStatus === "verified" && memory.sharingPermissions.includeInCareBrief && resident.sharingSettings?.shareMemoriesWithCareTeam !== false), [memories, resident]);
  const selectedMemory = residentMemories.find((memory) => memory.id === selectedMemoryId) ?? residentMemories[0];
  const signal = useMemo(() => evaluateHealthSignals(resident, observations), [resident, observations]);
  const recentObservations = useMemo(() => observations.filter((observation) => observation.residentId === resident.id && signal.windowDates.includes(observation.date)).sort((a, b) => a.date.localeCompare(b.date) || a.type.localeCompare(b.type)), [observations, resident.id, signal.windowDates]);
  const residentHandoffs = handoffs.filter((item) => item.residentId === resident.id);
  const briefDate = signal.windowDates[signal.windowDates.length - 1] || "2026-10-16";

  function useMemoryPrompt() {
    if (!selectedMemory) return;
    const names = selectedMemory.verifiedFacts.people.map((person) => `${person.name}${person.relationship ? ` (${person.relationship})` : ""}`).join(" and ");
    setAction(`Offered the family memory photo: “${selectedMemory.proposedCaption}.”`);
    setResponse("");
    if (names) setNotice(`Prompt selected from a verified family memory. People confirmed by ${selectedMemory.contributorId}: ${names}. Record only what you personally observe.`);
    else setNotice("Prompt selected from a verified family memory. Record only what you personally observe.");
  }

  function saveInteraction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setNotice("");
    if (!action.trim() || !response.trim()) { setNotice("Add what you did and what you observed before saving the handoff."); return; }
    const entry: InteractionOutcome = {
      id: `handoff_${Date.now()}`, residentId: resident.id, timestamp: new Date().toISOString(), caregiverId: caregiver.trim() || "Care team member",
      actionRecorded: action.trim(), observedResponse: response.trim(), followUpRequired, followUpNotes: followUpRequired ? followUpNotes.trim() : "",
      relatedMemoryId: action.includes("Offered the family memory photo") ? selectedMemory?.id : undefined,
    };
    addHandoff(entry); setHandoffs(readHandoffs()); setAction(""); setResponse(""); setFollowUpRequired(false); setFollowUpNotes("");
    setNotice("Follow-up saved to this browser's care handoff. It is separate from care observations.");
  }

  return <>
    <div className="resident-detail-top"><div><Link href={`/caregiver/resident/${resident.id}`} className="back-link">← {resident.preferredName}&apos;s resident detail</Link><div className="page-heading-row"><div><div className="section-kicker">NEXT VISIT HANDOFF · {humanDate(briefDate)}</div><h2>Today&apos;s care brief</h2><p className="lead">A source-linked, resident-specific briefing for the next caregiver.</p></div></div></div><span className="tag tag-verified">FICTIONAL DEMO</span></div>
    <div className="resident-brief-sections">
      <section className="panel brief-section personal-context-section"><div className="brief-section-heading"><span className="brief-section-number">01</span><div><div className="section-kicker">VERIFIED FAMILY RECORDS</div><h3>Personal context</h3><p>Shared only when the family record permits care-team access.</p></div></div>
        {selectedMemory ? <div className="brief-memory-record"><div className="brief-memory-icon" aria-hidden="true">♡</div><div className="brief-memory-copy"><span className="tag tag-verified">VERIFIED</span><h4>{selectedMemory.proposedCaption}</h4><p>{selectedMemory.verifiedFacts.comfortingDetails || selectedMemory.familyStory}</p><div className="brief-record-meta">Source: {selectedMemory.contributorId} · Family memory date: {selectedMemory.eventDate ? humanDate(selectedMemory.eventDate) : "Not specified"}</div><div className="brief-permission">✓ Family granted care-team permission for this memory</div></div></div> : <p className="brief-empty">No verified family memory is currently shared with this care team.</p>}
        <Link href={resident.id === "res_001" ? "/family-memories" : "/caregiver"} className="brief-section-link">{resident.id === "res_001" ? "Open Nancy’s family memory collection →" : "Return to resident dashboard →"}</Link>
      </section>

      <section className="panel brief-section observations-context-section"><div className="brief-section-heading"><span className="brief-section-number">02</span><div><div className="section-kicker">TIME-STAMPED CARE RECORDS</div><h3>Recent care observations</h3><p>Values in the current rule window are compared with {resident.preferredName}&apos;s baseline.</p></div><span className={`signal-status status-${signal.overallStatus}`}>{signal.overallStatus.replaceAll("_", " ")}</span></div>
        <div className="brief-observation-list">{recentObservations.length ? recentObservations.map((observation) => <article className="brief-observation" key={observation.id}><span className={`domain-dot domain-${observation.type}`}/><div><strong>{valueText(observation)}</strong><p>{observation.sourceNote}</p><small>{humanDate(observation.date)} · Recorded by {observation.sourceRole.replaceAll("_", " ")}</small></div><span className="baseline-delta">Baseline {baselineText(observation, resident)}</span></article>) : <p className="brief-empty">No observations in the current review window.</p>}</div>
        <p className="brief-observation-disclaimer">The configured rules summarize recorded values for human review only. They do not diagnose, predict, or establish why a change occurred.</p>
        <Link href={`/caregiver/resident/${resident.id}`} className="brief-section-link">View all three timelines and supporting evidence →</Link>
      </section>

      <section className="panel brief-section followup-section"><div className="brief-section-heading"><span className="brief-section-number">03</span><div><div className="section-kicker">CAREGIVER-RECORDED INTERACTION</div><h3>Follow-up and handoff</h3><p>Document what you did and personally observed. This does not change the health observations.</p></div></div>
        {selectedMemory && <div className="memory-prompt-row"><div><strong>Optional conversation prompt</strong><span>Verified family memory: “{selectedMemory.proposedCaption}” · Source: {selectedMemory.contributorId}</span></div><button className="button button-outline" type="button" onClick={useMemoryPrompt}>Use this photo as a prompt</button></div>}
        <form className="interaction-form" onSubmit={saveInteraction}>
          <label>Recorded by<input value={caregiver} onChange={(event) => setCaregiver(event.target.value)} required/></label>
          <label>What did you observe or do?<textarea rows={2} value={action} onChange={(event) => setAction(event.target.value)} placeholder="For example: Offered Nancy the Theo photo and invited her to look at it." required/></label>
          <label>What was the resident&apos;s response?<textarea rows={2} value={response} onChange={(event) => setResponse(event.target.value)} placeholder="Record only what you observed, in your own words." required/></label>
          <label className="followup-toggle"><input type="checkbox" checked={followUpRequired} onChange={(event) => setFollowUpRequired(event.target.checked)}/><span>Another follow-up is needed</span></label>
          {followUpRequired && <label>Follow-up for the next caregiver<textarea rows={2} value={followUpNotes} onChange={(event) => setFollowUpNotes(event.target.value)} placeholder="What should the next caregiver revisit?"/> </label>}
          <p className="interaction-boundary-note">A response to a family photo is an interaction note. It is not evidence of a change in health or cognition.</p>
          <button className="button button-primary" type="submit">Save handoff for next caregiver</button>
        </form>
        {notice && <p className="care-form-notice" role="status">{notice}</p>}
        <div className="handoff-history"><div className="handoff-history-heading"><h4>Previous caregiver handoffs</h4><span>{residentHandoffs.length} saved in this browser</span></div>
          {residentHandoffs.length ? residentHandoffs.map((item) => <article className="handoff-history-card" key={item.id}><div className="handoff-history-meta"><strong>{item.caregiverId}</strong><time dateTime={item.timestamp}>{new Date(item.timestamp).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" })}</time></div><p><b>Action:</b> {item.actionRecorded}</p><p><b>Observed response:</b> {item.observedResponse}</p>{item.followUpRequired && <p className="handoff-follow-up"><b>Follow-up needed:</b> {item.followUpNotes || "Yes; details to be confirmed."}</p>}</article>) : <p className="brief-empty">New notes will appear here with the caregiver&apos;s name and time.</p>}
        </div>
      </section>
    </div>
  </>;
}
