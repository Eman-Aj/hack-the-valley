"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { CareObservation, NursingNote } from "../lib/types";

type Overview = {
    summary: string;
    meals: string;
    mobility: string;
    sleep: string;
    questions: string;
    caregiverNotes: string;
};

export default function ChartOverview({
    residentId,
    observations,
    questionDays,
    nursingNotes,
}: {
    residentId: string;
    observations: CareObservation[];
    questionDays: { date: string; count: number }[];
    nursingNotes: NursingNote[];
}) {
    const [open, setOpen] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const [response, setResponse] = useState<{
        payload: string;
        result?: Overview;
        error?: string;
    } | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const popupId = useId();

    const payload = JSON.stringify({
        residentId,

        observations: observations.map(({ date, type, value }) => ({
            date,
            type,
            value,
        })),

        questionDays,

        nursingNotes: nursingNotes
            .filter((note) =>
                questionDays.some(
                    (day) =>
                        new Date(note.recordedAt).toLocaleDateString("en-CA") ===
                        new Date(`${day.date}T12:00:00`).toLocaleDateString("en-CA"),
                ),
            )
            .map(({ recordedAt, category, note }) => ({
                recordedAt,
                category,
                note,
            })),
    });

    const hasData =
        observations.length > 0 ||
        questionDays.some((day) => day.count > 0) ||
        JSON.parse(payload).nursingNotes.length > 0;

    // A response is only shown if it matches the current chart data.
    const current = response?.payload === payload ? response : null;
    const loading = open && hasData && !current;

    useEffect(() => {
        if (!open) return;

        function closeOutside(event: PointerEvent) {
            if (!containerRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        function closeOnEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setOpen(false);
                buttonRef.current?.focus();
            }
        }

        document.addEventListener("pointerdown", closeOutside);
        document.addEventListener("keydown", closeOnEscape);

        return () => {
            document.removeEventListener("pointerdown", closeOutside);
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, [open]);

    useEffect(() => {
        if (!open || !hasData || current) return;

        const controller = new AbortController();
        let active = true;

        const timeout = setTimeout(() => controller.abort(), 30000);

        async function generateOverview() {
            try {
                const response = await fetch("/api/observation-overview", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: payload,
                    signal: controller.signal,
                });

                if (!response.ok) throw new Error("Overview unavailable");

                const data = await response.json();

                if (active) {
                    setResponse({ payload, result: data.result });
                }
            } catch {
                if (active) {
                    setResponse({
                        payload,
                        error: "We couldn’t create the overview. Please try again.",
                    });
                }
            } finally {
                clearTimeout(timeout);
            }
        }

        generateOverview();

        return () => {
            active = false;
            clearTimeout(timeout);
            controller.abort();
        };
    }, [open, payload, current, attempt, hasData]);

    return (
        <div className="chart-overview" ref={containerRef}>
            <button
                ref={buttonRef}
                type="button"
                className="chart-overview-trigger"
                aria-expanded={open}
                aria-controls={popupId}
                onClick={() => setOpen((value) => !value)}
            >
                <span aria-hidden="true">✦</span> AI overview
            </button>

            {open && (
                <section
                    id={popupId}
                    className="chart-overview-bubble"
                    aria-labelledby={`${popupId}-title`}
                    aria-busy={loading}
                >
                    <div className="chart-overview-heading">
                        <h4 id={`${popupId}-title`}>At a glance</h4>

                        <button
                            type="button"
                            className="chart-overview-close"
                            aria-label="Close AI overview"
                            onClick={() => {
                                setOpen(false);
                                buttonRef.current?.focus();
                            }}
                        >
                            ×
                        </button>
                    </div>

                    {loading && (
                        <p role="status">Reading the observations…</p>
                    )}

                    {!hasData && (
                        <p>Add observations, questions, or caregiver notes to get an overview.</p>
                    )}

                    {current?.error && (
                        <div role="status">
                            <p>{current.error}</p>
                            <button
                                type="button"
                                className="chart-overview-trigger"
                                onClick={() => {
                                    setResponse(null);
                                    setAttempt((value) => value + 1);
                                }}
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {current?.result && (
                        <div aria-live="polite">
                            <p className="chart-overview-summary">
                                {current.result.summary}
                            </p>

                            <dl className="chart-overview-details">
                                <div>
                                    <dt>Meals</dt>
                                    <dd>{current.result.meals}</dd>
                                </div>
                                <div>
                                    <dt>Mobility</dt>
                                    <dd>{current.result.mobility}</dd>
                                </div>
                                <div>
                                    <dt>Sleep</dt>
                                    <dd>{current.result.sleep}</dd>
                                </div>
                                <div>
                                    <dt>Questions asked</dt>
                                    <dd>{current.result.questions}</dd>
                                </div>

                                <div>
                                    <dt>Caregiver observations</dt>
                                    <dd>{current.result.caregiverNotes}</dd>
                                </div>
                            </dl>

                            <p className="chart-overview-note">
                                AI summary of recorded observations. Not a diagnosis.
                            </p>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}