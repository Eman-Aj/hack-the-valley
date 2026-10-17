import { Suspense } from "react";
import { notFound } from "next/navigation";
import RouteHeader from "@/components/RouteHeader";
import ResidentDetail from "@/components/ResidentDetail";
import { MOCK_RESIDENTS } from "@/lib/mock-db";

type ResidentPageProps = { params: Promise<{ residentId: string }> };

export function generateStaticParams() {
  return MOCK_RESIDENTS.map(({ id }) => ({ residentId: id }));
}

export default function ResidentPage({ params }: ResidentPageProps) {
  return <main className="route-page">
    <RouteHeader section="Resident detail"/>
    <div className="route-content">
      <Suspense fallback={<p role="status">Loading resident details…</p>}>
        <ResidentDetails params={params}/>
      </Suspense>
      <footer className="route-footer">MemoryLane prototype · Fictional demo data only</footer>
    </div>
  </main>;
}

async function ResidentDetails({ params }: ResidentPageProps) {
  const { residentId } = await params;
  const resident = MOCK_RESIDENTS.find((item) => item.id === residentId);
  if (!resident) notFound();
  return <ResidentDetail resident={resident}/>;
}
