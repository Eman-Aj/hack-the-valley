import CareTeamDashboard from "@/components/CareTeamDashboard";
import RouteHeader from "@/components/RouteHeader";

export default function CaregiverPage() {
  return <main className="route-page"><RouteHeader section="Care team dashboard"/><div className="route-content"><CareTeamDashboard/><footer className="route-footer">MemoryLane prototype · Fictional demo data only</footer></div></main>;
}
