import type { Resident } from "../lib/types";

const notRecorded = "Not recorded";

export default function ResidentClinicalSummary({
  resident,
  compact = false,
}: {
  resident: Resident;
  compact?: boolean;
}) {
  const details = [
    { label: "Age", value: resident.age !== undefined ? `${resident.age} years` : notRecorded },
    { label: "Gender", value: resident.gender || notRecorded },
    { label: "Pronouns", value: resident.pronouns || notRecorded },
  ];

  return (
    <dl className={`resident-clinical-summary${compact ? " is-compact" : ""}`}>
      {details.map(({ label, value }) => (
        <div className="clinical-detail" key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
      <div className="clinical-diagnosis">
        <dt>Diagnosis</dt>
        <dd>{resident.diagnosis || notRecorded}</dd>
      </div>
      <div className="clinical-diagnosis">
        <dt>Other diagnoses</dt>
        <dd>{resident.otherDiagnoses?.length ? resident.otherDiagnoses.join(", ") : "None recorded"}</dd>
      </div>
    </dl>
  );
}
