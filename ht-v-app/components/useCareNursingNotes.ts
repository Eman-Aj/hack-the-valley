"use client";

import { useEffect, useState } from "react";
import { readNursingNotes } from "../lib/care-demo-storage";
import type { NursingNote } from "../lib/types";

export default function useCareNursingNotes() {
  const [notes, setNotes] = useState<NursingNote[]>([]);

  useEffect(() => {
    const refresh = () => setNotes(readNursingNotes());
    refresh();
    window.addEventListener("memorylane:care-data-updated", refresh);
    return () => window.removeEventListener("memorylane:care-data-updated", refresh);
  }, []);

  return notes;
}
