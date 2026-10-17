import Link from "next/link";

const demos = [
  { href: "/caregiver", icon: "↗", label: "CARE TEAM DEMO", title: "Caregiver workspace", text: "Review all six residents, open timelines and evidence, and leave a clear handoff for the next caregiver.", action: "Open care team dashboard", tone: "home-card-care" },
  { href: "/memories", icon: "♡", label: "FAMILY DEMO · NANCY WILSON", title: "Nancy's MemoryLane", text: "Browse Nancy's simple memory book and ask a question about a family photo. Family members can add a verified memory too.", action: "Open Nancy's memory book", tone: "home-card-senior" },
];

export default function Home() {
  return <main className="home-page">
    <header className="home-header"><Link className="brand" href="/"><span className="brand-mark">ml</span><span><strong>MemoryLane</strong><small>MEMORIES & CARE</small></span></Link><span className="demo-pill">FICTIONAL DEMO</span></header>
    <section className="home-hero"><div className="home-eyebrow"><span className="status-dot"/> A PERSON-CENTERED CARE HANDOFF DEMO</div><h1>Care that remembers<br/><em>the whole person.</em></h1><p>Choose a demo to explore. Each one has a clear role and a different view of care.</p></section>
    <section className="home-destinations home-destinations-two" aria-label="Choose a demo">
      {demos.map((demo) => <Link className={`home-destination ${demo.tone}`} href={demo.href} key={demo.href}>
        <div className="home-destination-top"><span className="home-number">{demo.label}</span><span className="home-arrow" aria-hidden="true">{demo.icon}</span></div>
        <h2>{demo.title}</h2><p>{demo.text}</p><span className="home-action">{demo.action} <b aria-hidden="true">→</b></span>
      </Link>)}
    </section>
    <footer className="home-footer"><span>MemoryLane prototype</span><span>Fictional data only · Signals request human review; they are not diagnoses</span></footer>
  </main>;
}
