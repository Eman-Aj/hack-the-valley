import { notFound } from "next/navigation";
import RouteHeader from "@/components/RouteHeader";
import ResidentCareBrief from "@/components/ResidentCareBrief";
import { MOCK_RESIDENTS } from "@/lib/mock-db";

export default async function ResidentBriefPage({ params }: { params: Promise<{ residentId: string }> }) {
  const { residentId } = await params;
  const resident = MOCK_RESIDENTS.find((item) => item.id === residentId);
  if (!resident) notFound();
  return <main className="route-page"><RouteHeader section={`${resident.preferredName} · Today's brief`}/><div className="route-content"><ResidentCareBrief resident={resident}/><footer className="route-footer">MemoryLane prototype · Fictional demo data only</footer></div></main>;
}
