import type { CareTeamRole } from "./types";

export const CARE_ROLE_LABELS: Record<CareTeamRole, string> = {
  dietary_aide: "Dietary aide",
  care_aide: "Care aide",
  overnight_staff: "Overnight staff",
  care_partner: "Care partner",
  nurse: "Registered nurse (RN)",
  licensed_practical_nurse: "Licensed practical nurse (LPN)",
  physician: "Physician (MD/DO)",
};
