"use client";

import { useEffect, useMemo, useState } from "react";
import { QUESTION_ACTIVITY_EVENT, readQuestionActivity, type QuestionActivityEvent } from "../lib/question-activity";

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function QuestionFrequencyPanel({ residentId, residentName }: { residentId: string; residentName: string }) {
  const [events, setEvents] = useState<QuestionActivityEvent[]>([]);
  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    const refresh = () => {
      setEvents(readQuestionActivity(residentId));
      setToday(new Date());
    };
    refresh();
    window.addEventListener(QUESTION_ACTIVITY_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(QUESTION_ACTIVITY_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [residentId]);

  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6 + index);
    const key = localDateKey(date);
    return { key, label: date.toLocaleDateString("en-CA", { weekday: "short" }), count: events.filter((event) => localDateKey(new Date(event.askedAt)) === key).length };
  }), [events, today]);
  const recentCount = days.slice(4).reduce((sum, day) => sum + day.count, 0);
  const priorDailyAverage = days.slice(0, 4).reduce((sum, day) => sum + day.count, 0) / 4;
  const hasHistory = days.some((day) => day.count > 0);
  const increased = recentCount >= 3 && recentCount / 3 >= Math.max(1, priorDailyAverage * 2);
  const maxCount = Math.max(1, ...days.map((day) => day.count));

  return <section className="panel question-frequency-panel" aria-labelledby={`question-frequency-${residentId}`}>
    <div className="question-frequency-heading"><div><div className="section-kicker">COMMUNICATION ACTIVITY · LAST 7 DAYS</div><h3 id={`question-frequency-${residentId}`}>Questions asked</h3><p>Tracks how often {residentName} asks, without saving question text.</p></div><strong className="question-frequency-total">{days.reduce((sum, day) => sum + day.count, 0)}<small> total</small></strong></div>
    <div className="question-frequency-chart" role="img" aria-label={`Daily question counts over the last seven days: ${days.map((day) => `${day.label} ${day.count}`).join(", ")}`}>
      {days.map((day) => <div className="question-frequency-day" key={day.key}><span className="question-frequency-count">{day.count}</span><div className="question-frequency-bar-track"><i style={{ height: `${Math.max(day.count ? 12 : 3, day.count / maxCount * 100)}%` }}/></div><span>{day.label}</span></div>)}
    </div>
    <div className={`question-frequency-note ${increased ? "is-increased" : ""}`}>
      <strong>{increased ? "Recent activity is higher" : hasHistory ? "Activity trend is being monitored" : "Building an activity baseline"}</strong>
      <p>{increased
        ? `There were ${recentCount} questions in the most recent 3 days, compared with ${priorDailyAverage.toFixed(1)} per day in the preceding 4 days. Consider checking in and documenting context.`
        : hasHistory
          ? `${recentCount} questions in the most recent 3 days. Changes in question frequency can be useful context for the care team.`
          : "As questions are asked, this seven-day view will help the care team notice changes in communication activity."}</p>
    </div>
    <p className="question-frequency-disclaimer">An increase is a contextual cue for human review, not a diagnosis or a measure of cognition.</p>
  </section>;
}
