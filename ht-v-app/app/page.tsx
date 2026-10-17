"use client";

import { useState } from "react";
import CareBrief from "@/components/CareBrief";
import FamilyMemories from "@/components/FamilyMemories";
import SeniorMemories from "@/components/SeniorMemories";

type Screen = "brief" | "memories" | "senior-memories";

const navigation: { id: Screen; label: string; icon: string }[] = [
  { id: "brief", label: "Today's care brief", icon: "▤" },
  { id: "memories", label: "Add & manage memories", icon: "＋" },
  { id: "senior-memories", label: "Nancy's memories", icon: "▧" },
];

export default function Home() {
  const [screen, setScreen] = useState<Screen>("brief");

  return (
    <main className={`app-frame ${screen === "senior-memories" ? "senior-mode" : ""}`}>
      {/* Persistent navigation keeps the three MVP experiences one click away. */}
      <aside className="sidebar">
        <a className="brand" href="#home" onClick={() => setScreen("brief")}>
          <span className="brand-mark">ct</span>
          <span><strong>carethread</strong><small>PERSON-CENTERED CARE</small></span>
        </a>

        <div className="nav-label">WORKSPACE</div>
        <nav aria-label="Main navigation" className="main-nav">
          {navigation.map((item) => (
            <button
              aria-current={screen === item.id ? "page" : undefined}
              className={`nav-item ${screen === item.id ? "active" : ""}`}
              key={item.id}
              onClick={() => setScreen(item.id)}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              {item.label}
              {item.id === "brief" && <span className="nav-dot" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-spacer" />
        {/* Prototype status makes it clear this is fictional demonstration data. */}
        <div className="demo-note"><span className="demo-dot" /><div><strong>Demo workspace</strong><small>Fictional resident data</small></div></div>
        <button className="profile-button"><span className="avatar avatar-small">JW</span><span><strong>Jordan Wilson</strong><small>Family contributor</small></span><span className="profile-chevron">⌄</span></button>
      </aside>

      <section className="content-area">
        <header className="topbar">
          <div className="breadcrumbs">Residents <span>/</span> Nancy Wilson</div>
          <div className="topbar-right"><span className="demo-pill">DEMO</span><button className="help-button" aria-label="Help">?</button></div>
        </header>

        <div className="page-content">
          {/* Shared resident identity stays visible across all three screens. */}
          <section className="resident-header">
            <div className="resident-identity">
              <div className="avatar resident-avatar">NW</div>
              <div><div className="eyebrow">RESIDENT PROFILE <span className="status-dot" /> ACTIVE</div><h1>Nancy Wilson</h1><p>Prefers to be called Nancy <span className="muted-divider">·</span> Care team and family</p></div>
            </div>
            <button className="date-button"><span aria-hidden="true">▦</span> Saturday, October 17, 2026 <span className="chevron">⌄</span></button>
          </section>

          {/* Each role-specific experience is implemented in its own component file. */}
          {screen === "brief" && <CareBrief onOpenMemories={() => setScreen("memories")} />}
          {screen === "memories" && <FamilyMemories />}
          {screen === "senior-memories" && <SeniorMemories onExit={() => setScreen("brief")} />}

          <footer className="page-footer"><span>CareThread prototype</span><span>For demonstration only <span className="footer-separator">·</span> Not a clinical decision tool</span></footer>
        </div>
      </section>
    </main>
  );
}
