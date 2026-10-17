export default function FamilyMemories() {
  return <>
    <div className="page-heading-row"><div><div className="section-kicker">FAMILY & CARE PARTNER WORKSPACE</div><h2>Add and manage memories</h2><p className="lead">Share a story for Nancy to revisit. Review details before they appear in her memories.</p></div><button className="button button-primary">＋ Add a memory</button></div>
    {/* Upload and verification controls are visual placeholders for the planned flow. */}
    <section className="panel add-memory-panel"><div className="add-memory-intro"><div className="upload-icon">＋</div><div><h3>Add a family memory</h3><p>Share a photo and the story behind it. You&apos;ll review every detail before it becomes part of Nancy&apos;s story.</p></div></div><div className="upload-drop"><div className="upload-cloud">↑</div><strong>Choose a photo to get started</strong><span>JPG or PNG · up to 10 MB</span><button className="button button-outline">Choose photo</button></div><div className="form-grid"><div className="form-field"><label htmlFor="memory-story">Your story</label><textarea id="memory-story" rows={3} placeholder="What would you like to remember about this moment?"/></div><div className="form-field"><label htmlFor="memory-date">When did this happen?</label><input id="memory-date" type="text" placeholder="e.g. Summer 2024"/><label htmlFor="memory-people">Who is in this memory?</label><input id="memory-people" type="text" placeholder="Names and relationships"/></div></div><div className="ai-draft-note"><span>✦</span><p><strong>AI-assisted draft</strong><br/>A suggested caption can be created from your story. You stay in control: nothing is marked verified until you confirm it.</p><button className="button button-soft">Generate draft</button></div></section>
    <div className="gallery-heading"><div><div className="section-kicker">NANCY&apos;S STORY</div><h3>ldaldasjdas collection <span className="count-pill">3</span></h3></div><button className="small-select">All memories <span>⌄</span></button></div>
    <div className="memory-grid">
      <MemoryCard title="The day Nancy met Theo" date="June 14, 2024" status="Verified" tone="verified" art="memory-art" description="A first meeting with her new grandson."/>
      <MemoryCard title="Sunday dinners at home" date="October 02, 2023" status="Verified" tone="verified" art="memory-art art-dinner" description="Nancy's favorite tradition was gathering everyone around the table."/>
      <MemoryCard title="A trip to the lake" date="August 19, 2022" status="Needs review" tone="pending" art="memory-art art-lake" description="A summer afternoon with family by the water."/>
    </div>
  </>;
}

function MemoryCard({ title, date, status, tone, art, description }: { title: string; date: string; status: string; tone: string; art: string; description: string }) {
  return <article className="panel memory-card"><div className={`memory-art card-art ${art}`}><span className="sun"/><span className="hill hill-one"/><span className="hill hill-two"/></div><div className="memory-card-body"><div className="memory-card-meta"><span>{date}</span><span className={`tag tag-${tone}`}>{tone === "verified" ? "✓ " : "• "}{status}</span></div><h4>{title}</h4><p>{description}</p><div className="source-line"><span className="source-avatar">JW</span> Shared by Jordan, her son</div></div></article>;
}
