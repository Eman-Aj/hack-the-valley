import type { Resident } from "../lib/types";

export default function ResidentCareSnapshot({
  resident,
  compact = false,
}: {
  resident: Resident;
  compact?: boolean;
}) {
  const profile = resident.careProfile;
  const familyContacts = profile?.familyContacts ?? [];
  const displayedContacts = familyContacts;

  return (
    <section className={`resident-care-snapshot${compact ? " is-compact" : ""}`} aria-label="Current care contacts and location">
      {!compact && (
        <div className="resident-care-snapshot-heading">
          <div>
            <div className="section-kicker">CURRENT CARE SNAPSHOT</div>
            <h3>Care team &amp; contacts</h3>
          </div>
          <span className="tag tag-amber">Fictional demo details</span>
        </div>
      )}
      <dl className="resident-care-facts">
        <div>
          <dt>Care location</dt>
          <dd>
            {profile
              ? `${profile.facility} · ${profile.unit}, Room ${profile.room}`
              : "Not recorded"}
          </dd>
          {profile && <dd className="resident-care-subdetail"><PhoneValue phone={profile.facilityPhone} compact={compact}/> · Main desk</dd>}
        </div>
        <div>
          <dt>Primary clinician</dt>
          <dd>
            {profile
              ? `${profile.primaryClinician.name}, ${profile.primaryClinician.title}`
              : "Not recorded"}
          </dd>
          {profile && <dd className="resident-care-subdetail">{profile.primaryClinician.specialty} · <PhoneValue phone={profile.primaryClinician.phone} compact={compact}/></dd>}
        </div>
        <div>
          <dt>Family contacts</dt>
          {displayedContacts.length ? (
            displayedContacts.map((contact) => (
              <dd className="resident-family-contact" key={contact.phone}>
                <span>{contact.name} <small>({contact.relationship})</small></span>
                <PhoneValue phone={contact.phone} compact={compact}/>
              </dd>
            ))
          ) : (
            <dd>Not recorded</dd>
          )}
        </div>
        {!compact && (
          <>
            <div>
              <dt>Allergy status</dt>
              <dd>Not recorded in this demo. Verify the allergy record before use.</dd>
            </div>
            <div>
              <dt>Medications</dt>
              <dd>Refer to the current medication administration record (MAR).</dd>
            </div>
          </>
        )}
      </dl>
      {!compact && <p className="resident-care-disclaimer">All names, locations, and phone numbers shown are fictional placeholders. Confirm current details in the official chart and facility directory.</p>}
    </section>
  );
}

function PhoneValue({ phone, compact = false }: { phone: string; compact?: boolean }) {
  return compact
    ? <span>{phone}</span>
    : <a href={`tel:${phone.replace(/[^\d+]/g, "")}`}>{phone}</a>;
}
