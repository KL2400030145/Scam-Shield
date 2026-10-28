import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Activity, ArrowUpRight, LayoutDashboard, Menu, ScanSearch, Shield, X, Clock3, BookOpen } from "lucide-react";

const links = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/analyze", label: "Analyze a job", icon: ScanSearch },
  { to: "/history", label: "Scan history", icon: Clock3 },
  { to: "/about", label: "Methodology", icon: BookOpen },
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="app-shell">
      {open && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setOpen(false)} />}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand"><span className="brand-mark"><Shield size={19} /></span><span>scam<span className="brand-light">shield</span><small>AI · OPPORTUNITY CHECK</small></span></div>
        <div className="side-caption">WORKSPACE</div>
        <nav aria-label="Main navigation" className="side-nav">
          {links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}><Icon size={18} /><span>{label}</span>{to === "/analyze" && <ArrowUpRight size={14} className="nav-arrow" />}</NavLink>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note"><span className="note-icon"><Activity size={16} /></span><strong>Make informed decisions</strong><p>Screen the wording. Verify the opportunity independently.</p></div>
          <span className="version-tag">PERSONAL PROJECT · V1.0</span>
        </div>
      </aside>
      <div className="main-frame">
        <header className="topbar">
          <button className="icon-button menu-toggle" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>{open ? <X size={19} /> : <Menu size={19} />}</button>
          <div className="breadcrumb"><span>Workspace</span><span className="crumb-sep">/</span><strong>Opportunity intelligence</strong></div>
          <div className="topbar-right"><span className="service-pill"><span className="status-dot" /> Risk screening</span><div className="avatar" aria-label="ScamShield project">S</div></div>
        </header>
        <main className="page-content"><Outlet /></main>
        <footer className="app-footer"><span>ScamShield AI <span className="footer-sep">·</span> An estimate, never a verdict.</span><span>Protect your information. Verify through official channels.</span></footer>
      </div>
    </div>
  );
}
