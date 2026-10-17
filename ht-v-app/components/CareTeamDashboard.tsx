"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MOCK_RESIDENTS, MOCK_OBSERVATIONS } from "../lib/mock-db";
import { evaluateHealthSignals } from "../lib/signal-engine";
import { readCareObservations } from "../lib/care-demo-storage";
import ResidentAvatar from "./ResidentAvatar";
import ResidentCareSnapshot from "./ResidentCareSnapshot";
import ResidentClinicalSummary from "./ResidentClinicalSummary";
import ResidentNursingNotes from "./ResidentNursingNotes";
import useCareNursingNotes from "./useCareNursingNotes";
import type { CareObservation, SignalStatus } from "../lib/types";

const statusText: Record<SignalStatus, string> = {
  needs_review: "Needs review", monitor: "Monitor", no_pattern_detected: "No pattern detected", insufficient_data: "Insufficient data",
};
const statusExplanation: Record<SignalStatus, string> = {
  needs_review: "Sustained changes across multiple care domains",
  monitor: "A sustained change in one care domain",
  no_pattern_detected: "Recent observations are near the resident’s baseline",
  insufficient_data: "Recent observations are missing",
};

export default function CareTeamDashboard() {
  const [observations, setObservations] = useState<CareObservation[]>(MOCK_OBSERVATIONS);
  const nursingNotes = useCareNursingNotes();
  useEffect(() => {
    const refresh = () => setObservations(readCareObservations());
    refresh(); window.addEventListener("memorylane:care-data-updated", refresh);
    return () => window.removeEventListener("memorylane:care-data-updated", refresh);
  }, []);
  const summaries = useMemo(() => MOCK_RESIDENTS.map((resident) => ({ resident, signal: evaluateHealthSignals(resident, observations) })), [observations]);
  const counts = {
    needs_review: summaries.filter(({ signal }) => signal.overallStatus === "needs_review").length,
    monitor: summaries.filter(({ signal }) => signal.overallStatus === "monitor").length,
    insufficient: summaries.filter(({ signal }) => signal.overallStatus === "insufficient_data").length,
    no_pattern: summaries.filter(({ signal }) => signal.overallStatus === "no_pattern_detected").length,
  };

  return <>
    <div className="page-heading-row care-dashboard-heading"><div><div className="section-kicker">CARE TEAM OVERVIEW · OCTOBER 2026</div><h2>Care team dashboard</h2><p className="lead">A quick view of six fictional residents, based on recorded observations and the demo rules.</p></div><span className="tag tag-verified">DEMO DATA</span></div>
    <section className="care-summary-grid" aria-label="Care signal summary">
      <SummaryCard label="Residents" value={String(MOCK_RESIDENTS.length)} detail="In this demo" tone="blue"/>
      <SummaryCard label="Needs review" value={String(counts.needs_review)} detail="Multiple sustained domain changes" tone="review"/>
      <SummaryCard label="Monitor" value={String(counts.monitor)} detail="One domain has a sustained change" tone="monitor"/>
      <SummaryCard label="Insufficient data" value={String(counts.insufficient)} detail="Missing observations are not normal" tone="quiet"/>
      <SummaryCard label="No current pattern" value={String(counts.no_pattern)} detail="Recent values near baseline" tone="stable"/>
    </section>
    <div className="resident-list-heading"><div><div className="section-kicker">RESIDENTS</div><h3>Choose a resident</h3></div><span>Signals from deterministic demo rules</span></div>
    <section className="care-resident-grid" aria-label="Residents">
      {summaries.map(({ resident, signal }) => <article className="panel care-resident-card" key={resident.id}>
        <div className="care-resident-card-top"><ResidentAvatar resident={resident}/><span className={`signal-status status-${signal.overallStatus}`}>{statusText[signal.overallStatus]}</span></div>
        <h4>{resident.displayName}</h4><p>Prefers {resident.preferredName} · {statusExplanation[signal.overallStatus]}</p>
        <ResidentClinicalSummary resident={resident} compact/>
        <ResidentCareSnapshot resident={resident} compact/>
        <ResidentNursingNotes resident={resident} notes={nursingNotes.filter((note) => note.residentId === resident.id).sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))} compact limit={1}/>
        <div className="resident-domain-summary">{(["meal_intake", "mobility_assistance", "sleep_disruption"] as const).map((domain) => <span key={domain}><i className={`domain-dot domain-${domain}`}/>{domain === "meal_intake" ? "Meals" : domain === "mobility_assistance" ? "Mobility" : "Sleep"}<b>{statusText[signal.details[domain].status]}</b></span>)}</div>
        <div className="care-resident-actions"><Link className="care-resident-link" href={`/caregiver/resident/${resident.id}`}>View observations <b aria-hidden="true">→</b></Link><Link className="care-resident-link" href={`/caregiver/resident/${resident.id}/brief`}>View care brief <b aria-hidden="true">→</b></Link></div>
      </article>)}
    </section>
    <p className="care-rules-disclaimer">All observations and names are fictional. The configured rules only prompt a qualified person to review recorded changes; they do not diagnose or predict a condition.</p>
  </>;
}

function SummaryCard({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: string }) {
  return <article className={`panel care-summary-card summary-${tone}`}><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>;
}
