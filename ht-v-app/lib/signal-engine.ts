import type {
  Resident,
  CareObservation,
  ObservationType,
  SignalStatus,
} from "./types";

// Re-export CareObservation so any existing imports don't break
export type { CareObservation };

const MIN_OBSERVATIONS_IN_WINDOW = 2;

export interface DomainEvaluation {
  status: SignalStatus;
  recentValues: number[];
  observations: CareObservation[];
  baselineValue: number;
  explanation: string;
}

export interface HealthSignalSummary {
  residentId: string;
  overallStatus: SignalStatus;
  windowDates: string[];
  meal_intake: SignalStatus;
  mobility_assistance: SignalStatus;
  sleep_disruption: SignalStatus;
  details: Record<ObservationType, DomainEvaluation>;
}

function isConcerningObservation(
  type: ObservationType,
  value: number,
  baseline: number
): boolean {
  switch (type) {
    case "meal_intake":
      // Decline of 15% or more below resident's personal baseline
      return baseline - value >= 15;
    case "mobility_assistance":
      // Increase of 1+ level above baseline
      return value - baseline >= 1;
    case "sleep_disruption":
      // Increase of 1+ level above baseline
      return value - baseline >= 1;
  }
}

function evaluateDomain(
  type: ObservationType,
  baseline: number,
  recentObs: CareObservation[]
): DomainEvaluation {
  const recentValues = recentObs.map((o) => o.value);

  if (recentObs.length < MIN_OBSERVATIONS_IN_WINDOW) {
    return {
      status: "insufficient_data",
      recentValues,
      observations: recentObs,
      baselineValue: baseline,
      explanation: `Only ${recentObs.length} observation(s) recorded in the recent 3-day window; insufficient evidence to assess pattern.`,
    };
  }

  const concerningCount = recentObs.filter((o) =>
    isConcerningObservation(type, o.value, baseline)
  ).length;

  // Require at least 2 concerning observations within the 3-day window for a sustained pattern
  if (concerningCount >= 2) {
    return {
      status: "needs_review",
      recentValues,
      observations: recentObs,
      baselineValue: baseline,
      explanation: `Sustained change from baseline (${baseline}) across ${concerningCount} of the last ${recentObs.length} days (${recentValues.join(", ")}).`,
    };
  }

  return {
    status: "no_pattern_detected",
    recentValues,
    observations: recentObs,
    baselineValue: baseline,
    explanation: `Recent 3-day observations (${recentValues.join(", ")}) remain near baseline (${baseline}).`,
  };
}

export function evaluateHealthSignals(
  resident: Resident,
  allObservations: CareObservation[]
): HealthSignalSummary {
  const residentObservations = allObservations.filter((o) => o.residentId === resident.id);
  const latestDate = residentObservations.map((o) => o.date).sort((a, b) => b.localeCompare(a))[0];
  const windowDates = latestDate ? Array.from({ length: 3 }, (_, index) => {
    const day = new Date(`${latestDate}T00:00:00Z`);
    day.setUTCDate(day.getUTCDate() - (2 - index));
    return day.toISOString().slice(0, 10);
  }) : [];
  const residentRecentObs = residentObservations.filter((o) => windowDates.includes(o.date));

  const domains: ObservationType[] = [
    "meal_intake",
    "mobility_assistance",
    "sleep_disruption",
  ];

  const details = {} as Record<ObservationType, DomainEvaluation>;

  for (const type of domains) {
    const domainObs = residentRecentObs
      .filter((o) => o.type === type)
      .sort((a, b) => a.date.localeCompare(b.date));

    details[type] = evaluateDomain(type, resident.baseline[type], domainObs);
  }

  const statuses = domains.map((d) => details[d].status);
  const flaggedDomains = statuses.filter((s) => s === "needs_review").length;
  const insufficientDomains = statuses.filter(
    (s) => s === "insufficient_data"
  ).length;

  let overallStatus: SignalStatus = "no_pattern_detected";

  if (insufficientDomains > 0 && flaggedDomains === 0) {
    overallStatus = "insufficient_data";
  } else if (flaggedDomains >= 2) {
    overallStatus = "needs_review";
  } else if (flaggedDomains === 1) {
    overallStatus = "monitor";
  }

  return {
    residentId: resident.id,
    overallStatus,
    windowDates,
    meal_intake:
      flaggedDomains === 1 && details.meal_intake.status === "needs_review"
        ? "monitor"
        : details.meal_intake.status,
    mobility_assistance:
      flaggedDomains === 1 &&
      details.mobility_assistance.status === "needs_review"
        ? "monitor"
        : details.mobility_assistance.status,
    sleep_disruption:
      flaggedDomains === 1 && details.sleep_disruption.status === "needs_review"
        ? "monitor"
        : details.sleep_disruption.status,
    details,
  };
}
