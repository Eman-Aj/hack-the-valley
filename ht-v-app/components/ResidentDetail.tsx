"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState, type CSSProperties } from "react";
import { DATES, MOCK_OBSERVATIONS } from "../lib/mock-db";
import { evaluateHealthSignals } from "../lib/signal-engine";
import { addCareObservation, readCareObservations } from "../lib/care-demo-storage";
import { CARE_ROLE_LABELS } from "../lib/care-role-labels";
import ResidentAvatar from "./ResidentAvatar";
import ResidentCareSnapshot from "./ResidentCareSnapshot";
import ResidentClinicalSummary from "./ResidentClinicalSummary";
import ResidentNursingNotes from "./ResidentNursingNotes";
import useCareNursingNotes from "./useCareNursingNotes";
import type { CareObservation, CareTeamRole, ObservationType, Resident, SignalStatus } from "../lib/types";
import QuestionFrequencyPanel from "./QuestionFrequencyPanel";
import ChartOverview from "./ChartOverview";
import useQuestionDays from "./useQuestionDays";

const domains: { id: ObservationType; title: string; unit: string; max: number; color: string; baselineLabel: (value: number) => string; valueLabel: (value: number) => string }[] = [
  { id: "meal_intake", title: "Meal intake", unit: "%", max: 100, color: "#4c79b8", baselineLabel: (v) => `${v}% baseline`, valueLabel: (v) => `${v}%` },
  { id: "mobility_assistance", title: "Mobility assistance", unit: "level", max: 3, color: "#bd7c42", baselineLabel: (v) => `Level ${v} baseline`, valueLabel: (v) => `Level ${v}` },
  { id: "sleep_disruption", title: "Sleep disruption", unit: "level", max: 5, color: "#588c7d", baselineLabel: (v) => `Level ${v} baseline`, valueLabel: (v) => `Level ${v}` },
];

const statusText: Record<SignalStatus, string> = { needs_review: "Needs review", monitor: "Monitor", no_pattern_detected: "No pattern detected", insufficient_data: "Insufficient data" };
const displayDate = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString("en-CA", { month: "short", day: "numeric" });

export default function ResidentDetail({ resident }: { resident: Resident }) {
  const questionDays = useQuestionDays(resident.id);
  const [observations, setObservations] = useState<CareObservation[]>(MOCK_OBSERVATIONS);
  const nursingNotes = useCareNursingNotes();
  const [selectedDomain, setSelectedDomain] = useState<ObservationType | null>(null);
  const [date, setDate] = useState("2026-10-17");
  const [values, setValues] = useState<Record<ObservationType, string>>({ meal_intake: "50", mobility_assistance: "2", sleep_disruption: "2" });
  const [recordedBy, setRecordedBy] = useState("Maya Chen");
  const [recordedByRole, setRecordedByRole] = useState<CareTeamRole>("nurse");
  const [sourceNote, setSourceNote] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const refresh = () => setObservations(readCareObservations());
    refresh(); window.addEventListener("memorylane:care-data-updated", refresh);
    return () => window.removeEventListener("memorylane:care-data-updated", refresh);
  }, []);

  const residentObservations = useMemo(() => observations.filter((o) => o.residentId === resident.id), [observations, resident.id]);
  const signal = useMemo(() => evaluateHealthSignals(resident, observations), [resident, observations]);
  const chartDates = useMemo(() => [...new Set([...DATES, ...residentObservations.map((o) => o.date)])].sort(), [residentObservations]);
  const chartObservations = useMemo(
    () =>
      chartDates.flatMap((chartDate) =>
        domains.flatMap((domain) => {
          const observation = residentObservations.find(
            (item) =>
              item.date === chartDate &&
              item.type === domain.id,
          );

          return observation ? [observation] : [];
        }),
      ),
    [chartDates, residentObservations],
  );
  const residentNursingNotes = useMemo(
    () => nursingNotes.filter((note) => note.residentId === resident.id).sort((a, b) => b.recordedAt.localeCompare(a.recordedAt)),
    [nursingNotes, resident.id],
  );
  const selected = domains.find((domain) => domain.id === selectedDomain);

  function submitObservation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setNotice("");
    if (!confirmed) { setNotice("Please confirm this is an accurate demo observation before saving."); return; }
    for (const domain of domains) {
      const numericValue = Number(values[domain.id]);
      if (!Number.isFinite(numericValue) || numericValue < 0 || numericValue > domain.max) { setNotice(`${domain.title}: enter a value from 0 to ${domain.max}${domain.id === "meal_intake" ? "%" : ""}.`); return; }
    }
    const timestamp = Date.now();
    const entries = domains.map((domain, index): CareObservation => {
      const numericValue = Number(values[domain.id]);
      return { id: `obs_${resident.id}_${timestamp}_${index}`, residentId: resident.id, date, type: domain.id, value: numericValue, sourceRole: recordedByRole, recordedBy: recordedBy.trim(), sourceNote: sourceNote.trim() || `${CARE_ROLE_LABELS[recordedByRole]} recorded ${domain.valueLabel(numericValue)}.` };
    });
    try { entries.forEach(addCareObservation); } catch (error) { setNotice(error instanceof Error ? error.message : "Please check the observation values."); return; }
    setObservations(readCareObservations());
    setNotice(`All three observations saved for ${displayDate(date)}. The timelines and care signal have been recalculated.`);
    setConfirmed(false); setSourceNote(""); setDate(date > "2026-10-16" ? date : "2026-10-17");
  }

  const needsReview = signal.overallStatus === "needs_review";
  const isNancySeedWindow = resident.id === "res_001" && signal.windowDates.join(",") === "2026-10-14,2026-10-15,2026-10-16";

  return <>
    <div className="resident-detail-top"><div><Link href="/caregiver" className="back-link">← Care team dashboard</Link><div className="resident-detail-heading"><ResidentAvatar resident={resident} /><div className="resident-detail-heading-copy"><div className="section-kicker">RESIDENT DETAIL · {resident.id.toUpperCase()}</div><h2>{resident.displayName}</h2><p>Prefers {resident.preferredName} · {resident.age !== undefined ? `${resident.age} years` : "Age not recorded"} · {resident.pronouns || "Pronouns not recorded"}</p></div><span className={`signal-status status-${signal.overallStatus}`}>{statusText[signal.overallStatus]}</span></div></div>
      <Link className="button button-primary" href={`/caregiver/resident/${resident.id}/brief`}>Open today&apos;s care brief <span aria-hidden="true">→</span></Link>
    </div>
    <section className="panel resident-overview-panel" aria-label="Resident clinical overview">
      <div className="resident-overview-heading">
        <div>
          <div className="section-kicker">CLINICAL OVERVIEW</div>
          <h3>At a glance</h3>
        </div>
        <span className="tag tag-amber">Verify against current chart</span>
      </div>
      <ResidentClinicalSummary resident={resident} />
    </section>
    <ResidentCareSnapshot resident={resident} />
    <section className="panel timeline-section"><div className="panel-heading"><div><div className="section-kicker">{displayDate(chartDates[0] ?? DATES[0])}–{displayDate(chartDates[chartDates.length - 1] ?? DATES[DATES.length - 1])}, 2026</div><div className="timeline-title-with-overview">
  <h3>Observation timelines</h3>

  <ChartOverview
    residentId={resident.id}
    observations={chartObservations}
    questionDays={questionDays}
    nursingNotes={residentNursingNotes}
  />
</div></div><p>Each chart has its own scale. The horizontal line is this resident&apos;s baseline.</p></div>
      <div className="timeline-chart-grid">{domains.map((domain) => {
        const series = chartDates.map((chartDate) => ({ date: chartDate, observation: residentObservations.find((o) => o.date === chartDate && o.type === domain.id) }));
        return <ObservationChart key={domain.id} residentName={resident.preferredName} domain={domain} series={series} baseline={resident.baseline[domain.id]} />;
      })}</div>
    </section>
    <section className={`panel why-review-panel ${needsReview ? "is-needs-review" : ""}`}>
      <div className="why-review-heading"><div><div className="section-kicker">DETERMINISTIC DEMO RULES</div><h3>{needsReview ? `Why ${resident.preferredName} needs review` : `Current signal for ${resident.preferredName}`}</h3><p>{needsReview ? "The synthetic observation history shows sustained changes in the configured recent domains." : `Current rule result: ${statusText[signal.overallStatus].toLowerCase()}.`}</p></div><span className={`signal-status status-${signal.overallStatus}`}>{statusText[signal.overallStatus]}</span></div>
      <h4>Supporting evidence</h4>
      <div className="finding-grid">{domains.map((domain) => {
        const all = residentObservations.filter((o) => o.type === domain.id).sort((a, b) => a.date.localeCompare(b.date));
        const first = all[0]?.value; const last = all[all.length - 1]?.value;
        return <button className="finding-card" key={domain.id} onClick={() => setSelectedDomain(domain.id)}><span>{domain.title}</span><strong>{first === undefined ? "No records" : `${domain.valueLabel(first)} → ${domain.valueLabel(last!)}`}</strong><small>{statusText[signal.details[domain.id].status]} · {signal.details[domain.id].observations.length} recent observations</small><span className="finding-open">View supporting records <b>→</b></span></button>;
      })}</div>
      <div className="next-step-note"><strong>Suggested next step</strong><p>Review the recorded changes under the established care protocol. This is a human-review signal, not a diagnosis.</p></div>
      {!isNancySeedWindow && signal.windowDates.length > 0 && <p className="window-update-note">Signal window uses the resident&apos;s latest recorded dates: {signal.windowDates.map(displayDate).join(", ")}. New records update this window.</p>}
    </section>
    <ResidentNursingNotes resident={resident} notes={residentNursingNotes} allowEntry />
    <QuestionFrequencyPanel residentId={resident.id} residentName={resident.preferredName} />
    <section className="panel observation-form-panel"><div className="panel-heading"><div><div className="section-kicker">FICTIONAL DEMO DATA ENTRY</div><h3>Add an observation</h3><p>Save a confirmed record to update the timeline and recalculate the rule signal immediately.</p></div></div>
      <form className="observation-entry-form" onSubmit={submitObservation}>
        <label>Date for all three records<input type="date" value={date} min="2026-10-10" onChange={(event) => setDate(event.target.value)} required /></label>
        {domains.map((domain) => <label key={domain.id}>{domain.title} ({domain.id === "meal_intake" ? "%" : `level 0–${domain.max}`})<input type="number" min="0" max={domain.max} step="1" value={values[domain.id]} onChange={(event) => setValues((current) => ({ ...current, [domain.id]: event.target.value }))} required /></label>)}
        <label>Recorded by<input value={recordedBy} onChange={(event) => setRecordedBy(event.target.value)} required /></label>
        <label>Caregiver title<select value={recordedByRole} onChange={(event) => setRecordedByRole(event.target.value as CareTeamRole)}>{Object.entries(CARE_ROLE_LABELS).map(([role, label]) => <option key={role} value={role}>{label}</option>)}</select></label>
        <label className="observation-note-field">Source note for these observations (optional)<input value={sourceNote} onChange={(event) => setSourceNote(event.target.value)} placeholder="What was observed?" /></label>
        <label className="observation-confirm-field"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /><span>I confirm this is an accurate fictional demo observation.</span></label>
        <button className="button button-primary" type="submit">Save and update signal</button>
      </form>
      {notice && <p className="care-form-notice" role="status">{notice}</p>}
    </section>
    {selected && <EvidenceDialog resident={resident} domain={selected} observations={residentObservations.filter((o) => o.type === selected.id).sort((a, b) => a.date.localeCompare(b.date))} recentIds={new Set(signal.details[selected.id].observations.map((o) => o.id))} onClose={() => setSelectedDomain(null)} />}
  </>;
}

function ObservationChart({ residentName, domain, series, baseline }: {
  residentName: string; domain: (typeof domains)[number]; series: { date: string; observation?: CareObservation }[]; baseline: number;
}) {
  const left = 40, right = 520, top = 28, bottom = 168;
  const y = (value: number) => bottom - value / domain.max * (bottom - top);
  const step = series.length > 1 ? (right - left) / (series.length - 1) : 0;
  const points = series.flatMap((item, index) => item.observation ? [{ x: left + index * step, y: y(item.observation.value), observation: item.observation }] : []);
  return <article className="timeline-chart-card" style={{ "--chart-color": domain.color } as CSSProperties}>
    <div className="timeline-chart-title"><div><h4>{domain.title}</h4><p>Baseline: {domain.baselineLabel(baseline)}</p></div><span className={`domain-dot domain-${domain.id}`} /></div>
    <svg className="observation-chart" viewBox="0 0 560 220" role="img" aria-label={`${domain.title} timeline for ${residentName}; baseline ${domain.baselineLabel(baseline)}`}>
      {[0, .25, .5, .75, 1].map((fraction) => { const gridY = top + (bottom - top) * fraction; return <g key={fraction}><line x1={left} x2={right} y1={gridY} y2={gridY} className="chart-gridline" /><text x="5" y={gridY + 4} className="chart-axis-label">{Math.round(domain.max * (1 - fraction))}</text></g>; })}
      <line x1={left} x2={right} y1={y(baseline)} y2={y(baseline)} className="chart-baseline" />
      <text x={right - 2} y={y(baseline) - 5} textAnchor="end" className="chart-baseline-label">baseline</text>
      {points.length > 1 && <polyline points={points.map((point) => `${point.x},${point.y}`).join(" ")} className="chart-series-line" />}
      {series.map((item, index) => {
        const x = left + index * step; const pointY = item.observation ? y(item.observation.value) : bottom; return <g key={item.date}>
          {item.observation && <><circle cx={x} cy={pointY} r="5" className="chart-point" /><text x={x} y={pointY - 10} textAnchor="middle" className="chart-value-label">{item.observation.value}</text><title>{`${displayDate(item.date)}: ${domain.valueLabel(item.observation.value)} · ${item.observation.recordedBy ? `${item.observation.recordedBy}, ` : ""}${CARE_ROLE_LABELS[item.observation.sourceRole]}`}</title></>}
          <text x={x} y="195" textAnchor="middle" className="chart-date-label">{displayDate(item.date)}</text>
        </g>;
      })}
    </svg>
    <div className="chart-legend"><span><i className="chart-legend-value" /> Recorded value</span><span><i className="chart-legend-baseline" /> Resident baseline</span></div>
  </article>;
}

function EvidenceDialog({ resident, domain, observations, recentIds, onClose }: { resident: Resident; domain: (typeof domains)[number]; observations: CareObservation[]; recentIds: Set<string>; onClose: () => void }) {
  const baseline = resident.baseline[domain.id];
  return <div className="signal-modal-backdrop" onClick={onClose}><section className="signal-modal evidence-dialog" role="dialog" aria-modal="true" aria-labelledby="evidence-title" onClick={(event) => event.stopPropagation()}>
    <div className="signal-modal-heading"><div><div className="section-kicker">SPECIFIC OBSERVATION RECORDS</div><h3 id="evidence-title">{domain.title} evidence</h3></div><button className="signal-modal-close" onClick={onClose} aria-label="Close evidence">×</button></div>
    <div className="signal-baseline-box"><strong>{resident.preferredName}&apos;s baseline</strong><p>{domain.baselineLabel(baseline)}. {observations.length ? `Recorded history: ${domain.valueLabel(observations[0].value)} → ${domain.valueLabel(observations[observations.length - 1].value)}.` : "No recorded values yet."}</p></div>
    <h4>Supporting records</h4><ul className="signal-observation-list">{observations.map((observation) => <li key={observation.id} className={recentIds.has(observation.id) ? "is-current-evidence" : ""}><span className="signal-observation-date">{displayDate(observation.date)}{recentIds.has(observation.id) ? " · recent rule window" : ""}</span><strong>{domain.valueLabel(observation.value)}</strong><span>{observation.sourceNote} Recorded by {observation.recordedBy ? `${observation.recordedBy}, ` : ""}{CARE_ROLE_LABELS[observation.sourceRole]}.</span></li>)}</ul>
    <div className="signal-rule-box"><strong>Interpretation</strong><p>Configured demonstration rule compared these records with {domain.baselineLabel(baseline)}. This prompts review only; it is not a diagnosis.</p></div>
    <button className="button button-primary signal-done-button" onClick={onClose}>Close evidence</button>
  </section></div>;
}
