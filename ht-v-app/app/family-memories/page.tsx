import FamilyMemories from "@/components/FamilyMemories";
import RouteHeader from "@/components/RouteHeader";

export default function FamilyMemoriesPage() {
  return <main className="route-page">
    <RouteHeader section="Family & care partners" />
    <div className="route-content family-route-content">
      <FamilyMemories />
      <footer className="route-footer">MemoryLane prototype · Fictional demo data</footer>
    </div>
  </main>;
}
