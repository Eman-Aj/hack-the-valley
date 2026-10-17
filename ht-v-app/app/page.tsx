import Link from "next/link";

const destinations = [
  {
    href: "/caregiver",
    number: "01",
    role: "FOR CAREGIVERS",
    title: "Today's care brief",
    description: "See personal context, recent care observations, and notes from the last visit.",
    action: "Open care brief",
    tone: "home-card-care",
  },
  {
    href: "/memories",
    number: "02",
    role: "FOR NANCY",
    title: "Nancy's memory book",
    description: "Look through family memories and ask a simple question about a picture.",
    action: "Open memory book",
    tone: "home-card-senior",
  },
  {
    href: "/family-memories",
    number: "03",
    role: "FOR FAMILY & CARE PARTNERS",
    title: "Add or review memories",
    description: "Share a photo and story, then confirm the details Nancy can revisit.",
    action: "Manage memories",
    tone: "home-card-family",
  },
];

export default function Home() {
  return <main className="home-page">
    <header className="home-header">
      <Link className="brand" href="/">
        <span className="brand-mark">ct</span>
        <span><strong>carethread</strong><small>PERSON-CENTERED CARE</small></span>
      </Link>
      <span className="demo-pill">FICTIONAL DEMO</span>
    </header>

    <section className="home-hero">
      <div className="home-eyebrow"><span className="status-dot"/> NANCY WILSON · DEMO PROFILE</div>
      <h1>Care that remembers<br/><em>the whole person.</em></h1>
      <p>Choose a space to continue. Each one is designed for a different part of Nancy&apos;s care.</p>
    </section>

    <section className="home-destinations" aria-label="Choose a CareThread space">
      {destinations.map((item) => <Link className={`home-destination ${item.tone}`} href={item.href} key={item.href}>
        <div className="home-destination-top"><span className="home-number">{item.number}</span><span className="home-arrow" aria-hidden="true">↗</span></div>
        <div className="section-kicker">{item.role}</div>
        <h2>{item.title}</h2>
        <p>{item.description}</p>
        <span className="home-action">{item.action} <b aria-hidden="true">→</b></span>
      </Link>)}
    </section>

    <footer className="home-footer"><span>CareThread prototype</span><span>For demonstration only · Not a clinical decision tool</span></footer>
  </main>;
}
