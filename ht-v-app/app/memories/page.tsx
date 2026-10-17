import SeniorMemories from "@/components/SeniorMemories";
import RouteHeader from "@/components/RouteHeader";

export default function MemoriesPage() {
  return <main className="senior-route memories-route">
    <RouteHeader section="Nancy's memory book" />
    <SeniorMemories />
  </main>;
}
