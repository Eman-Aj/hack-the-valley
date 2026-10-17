export default function CareBrief({ onOpenMemories }: { onOpenMemories: () => void }) {
  return <>
    <div className="page-heading-row"><div><div className="section-kicker">HANDOFF OVERVIEW</div><h2>Today&apos;s care brief</h2><p className="lead">A thoughtful start to Nancy&apos;s next visit.</p></div><button className="button button-outline">↗ <span>Share brief</span></button></div>

    {/* The signal is a request for human review, not a diagnosis or prediction. */}
    <section className="review-banner">
      <div className="review-icon">!</div>
      <div className="review-copy"><div className="review-title">Review suggested <span className="tag tag-amber">HUMAN REVIEW</span></div><p>Recent meal intake and mobility observations differ from Nancy&apos;s recorded baseline.</p></div>
      <a className="text-link" href="#observations">See what changed <span>→</span></a>
    </section>

    <div className="brief-grid">
      <div className="primary-column">
        <section className="panel context-panel">
          <div className="panel-heading"><div><div className="section-kicker">KNOW THE PERSON</div><h3>Personal context</h3></div><span className="tag tag-green"><span className="tiny-check">✓</span> VERIFIED</span></div>
          <div className="memory-highlight">
            <div className="memory-art" aria-label="Illustration placeholder for a family photo" role="img"><span className="sun"/><span className="hill hill-one"/><span className="hill hill-two"/><span className="photo-caption">A family moment</span></div>
            <div className="memory-copy"><div className="memory-date">FAMILY MEMORY <span>·</span> JUNE 14, 2024</div><h4>The day Nancy met Theo</h4><p>Nancy&apos;s grandson Theo was just a few weeks old. She loves telling people about the day they met.</p><div className="source-line"><span className="source-avatar">JW</span> Shared by Jordan, her son</div></div>
          </div>
          <button className="button button-text" onClick={onOpenMemories}>Explore family memories <span>→</span></button>
        </section>

        <section className="panel observations-panel" id="observations">
          <div className="panel-heading observation-heading"><div><div className="section-kicker">RECENT CARE NOTES</div><h3>Recent observations</h3></div><button className="small-select">Last 7 days <span>⌄</span></button></div>
          <div className="observation-legend"><span><i className="legend-dot meal"/> Meal intake</span><span><i className="legend-dot mobility"/> Mobility support <span className="baseline-key">— usual range</span></span></div>
          {/* This lightweight visual is seeded sample data; real charting can be added later. */}
          <div className="chart-wrap"><div className="y-labels"><span>100%</span><span>75%</span><span>50%</span><span>25%</span></div><div className="chart"><div className="chart-gridline line-1"/><div className="chart-gridline line-2"/><div className="chart-gridline line-3"/><div className="baseline-band"/><div className="bar-set"><i style={{ height: "76%" }}/><i style={{ height: "68%" }}/><i style={{ height: "59%" }}/><i className="bar-low" style={{ height: "42%" }}/><i className="bar-low" style={{ height: "35%" }}/><i className="bar-low" style={{ height: "38%" }}/><i className="bar-low" style={{ height: "31%" }}/></div><div className="x-labels"><span>Oct 11</span><span>Oct 12</span><span>Oct 13</span><span>Oct 14</span><span>Oct 15</span><span>Oct 16</span><span>Today</span></div></div></div>
          <div className="observation-summary"><span className="summary-marker"/><p>Meal intake has been below Nancy&apos;s usual range for <strong>4 days</strong>.</p><button className="icon-button" aria-label="Observation details">↗</button></div>
          <div className="secondary-observation"><span className="mobility-icon">↗</span><p><strong>Mobility:</strong> More hands-on assistance recorded in 3 of the last 5 visits.</p><span className="observation-time">Today, 9:20 AM</span></div>
        </section>
      </div>

      <div className="secondary-column">
        <section className="panel change-panel"><div className="panel-heading"><div><div className="section-kicker">BASELINE COMPARISON</div><h3>What&apos;s changed</h3></div><span className="change-icon">↗</span></div>
          <div className="change-item"><div className="change-symbol meal-symbol">⌁</div><div><strong>Meal intake</strong><p>Lower than usual for 4 consecutive days</p><span className="change-meta">Usual: 75–100% <b>·</b> Recent: 30–55%</span></div></div>
          <div className="change-item"><div className="change-symbol mobility-symbol">↗</div><div><strong>Mobility assistance</strong><p>More support noted during recent visits</p><span className="change-meta">3 observations <b>·</b> Past 5 visits</span></div></div>
          <div className="rule-note"><span>ⓘ</span> Demonstration rules only. These are not clinically validated thresholds.</div>
        </section>

        <section className="panel follow-panel"><div className="section-kicker">CLOSE THE LOOP</div><h3>Follow-up</h3><p className="follow-description">Add a note for the next person supporting Nancy.</p><label className="field-label" htmlFor="follow-up">Visit note</label><textarea id="follow-up" placeholder="What would you like the next caregiver to know?" rows={3}/><div className="follow-actions"><span className="private-note">◉ Visible to care team</span><button className="button button-primary">Save handoff <span>→</span></button></div></section>
      </div>
    </div>
  </>;
}
