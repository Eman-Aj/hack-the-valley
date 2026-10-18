"use client";

import { useEffect, useMemo, useState } from "react";
import {
    QUESTION_ACTIVITY_EVENT,
    readQuestionActivity,
    type QuestionActivityEvent,
} from "../lib/question-activity";

function dateKey(date: Date) {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
    ].join("-");
}

export default function useQuestionDays(residentId: string) {
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

    return useMemo(
        () =>
            Array.from({ length: 7 }, (_, index) => {
                const date = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate() - 6 + index,
                );
                const key = dateKey(date);

                return {
                    date: key,
                    count: events.filter(
                        (event) => dateKey(new Date(event.askedAt)) === key,
                    ).length,
                };
            }),
        [events, today],
    );
}