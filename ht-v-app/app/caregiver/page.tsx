import CareBrief from "@/components/CareBrief";
import RouteHeader from "@/components/RouteHeader";

export default function CaregiverPage() {
  return <main className="route-page">
    <RouteHeader section="Caregiver workspace" />
    <div className="route-content">
      <div className="resident-header route-resident-header">
        <div className="resident-identity">
          <div className="avatar resident-avatar">NW</div>
          <div><div className="eyebrow">RESIDENT PROFILE <span className="status-dot"/> ACTIVE</div><h1>Nancy Wilson</h1><p>Prefers to be called Nancy <span className="muted-divider">·</span> Fictional demo profile</p></div>
        </div>
        <span className="demo-pill">DEMO DATA</span>
      </div>
      <CareBrief />
      <footer className="route-footer">CareThread prototype · Not a clinical decision tool</footer>
    </div>
  </main>;
}
