import { Resident, SignalStatus, SignalType } from "./types";

export interface CareObservation {
  date: string;
  type: SignalType;
  value: number; 
}

/**
 * DETERMINISTIC RULES ENGINE
 * Evaluates recent clinical observations against a resident's historical baseline.
 * 
 * Rules:
 * - Meal Intake: Flags if average drops 20% below baseline.
 * - Sleep: Flags if disruptions increase 1.5x over baseline.
 * - Mobility: Flags if assistance needed increases by more than 1 point.
 */
export function evaluateHealthSignals(
  resident: Resident,
  recentObservations: CareObservation[]
): Record<SignalType, SignalStatus> {
  
  // Initialize default statuses
  const results: Record<SignalType, SignalStatus> = {
    meal_intake: "insufficient_data",
    mobility_assistance: "insufficient_data",
    sleep_disruption: "insufficient_data",
  };

  // Helper to calculate the recent average for a specific signal
  const getAverage = (type: SignalType) => {
    const obs = recentObservations.filter(o => o.type === type);
    if (obs.length === 0) return null;
    const sum = obs.reduce((acc, curr) => acc + curr.value, 0);
    return sum / obs.length;
  };

  // 1. Evaluate Meal Intake
  const avgMeals = getAverage("meal_intake");
  if (avgMeals !== null) {
    results.meal_intake = avgMeals < resident.baseline.meal_intake * 0.8 
      ? "needs_review" 
      : "no_pattern_detected";
  }

  // 2. Evaluate Sleep Disruption
  const avgSleep = getAverage("sleep_disruption");
  if (avgSleep !== null) {
    results.sleep_disruption = avgSleep > resident.baseline.sleep_disruption * 1.5 
      ? "needs_review" 
      : "no_pattern_detected";
  }

  // 3. Evaluate Mobility
  const avgMobility = getAverage("mobility_assistance");
  if (avgMobility !== null) {
    results.mobility_assistance = avgMobility > resident.baseline.mobility_assistance + 1 
      ? "needs_review" 
      : "no_pattern_detected";
  }

  return results;
}