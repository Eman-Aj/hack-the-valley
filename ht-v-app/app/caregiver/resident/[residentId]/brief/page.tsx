import { Suspense } from "react";
import { notFound } from "next/navigation";
import RouteHeader from "@/components/RouteHeader";
import ResidentCareBrief from "@/components/ResidentCareBrief";
import { MOCK_RESIDENTS } from "@/lib/mock-db";

type ResidentBriefPageProps = { params: Promise<{ residentId: string }> };

export function generateStaticParams() {
  return MOCK_RESIDENTS.map(({ id }) => ({ residentId: id }));
}

export default function ResidentBriefPage({ params }: ResidentBriefPageProps) {
  return (
    <Suspense fallback={<main className="route-page"><RouteHeader section="Today's care brief"/><div className="route-content"><p role="status">Loading care brief…</p></div></main>}>
      <ResidentBriefContent params={params}/>
    </Suspense>
  );
}

async function ResidentBriefContent({ params }: ResidentBriefPageProps) {
  const { residentId } = await params;
  const resident = MOCK_RESIDENTS.find((item) => item.id === residentId);
  if (!resident) notFound();

  return (
    <main className="route-page">
      <RouteHeader section={`${resident.preferredName} · Today's brief`}/>
      <div className="route-content">
        <ResidentCareBrief resident={resident}/>
        <footer className="route-footer">MemoryLane prototype · Fictional demo data only</footer>
      </div>
    </main>
  );
}
