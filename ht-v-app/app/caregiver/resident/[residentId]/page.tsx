import { notFound } from "next/navigation";
import RouteHeader from "@/components/RouteHeader";
import ResidentDetail from "@/components/ResidentDetail";
import { MOCK_RESIDENTS } from "@/lib/mock-db";

export default async function ResidentPage({ params }: { params: Promise<{ residentId: string }> }) {
  const { residentId } = await params;
  const resident = MOCK_RESIDENTS.find((item) => item.id === residentId);
  if (!resident) notFound();
  return <main className="route-page"><RouteHeader section="Resident detail"/><div className="route-content"><ResidentDetail resident={resident}/><footer className="route-footer">MemoryLane prototype · Fictional demo data only</footer></div></main>;
}
