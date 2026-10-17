import Link from "next/link";

export default function RouteHeader({ section }: { section: string }) {
  return <header className="route-header">
    <Link className="brand" href="/" aria-label="MemoryLane home">
      <span className="brand-mark">ml</span>
      <span><strong>MemoryLane</strong><small>MEMORIES & CARE</small></span>
    </Link>
    <div className="route-header-right"><span>{section}</span><Link href="/">Home</Link></div>
  </header>;
}
