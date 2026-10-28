import { AlertCircle, Check, LoaderCircle, ShieldAlert } from "lucide-react";

export function PageHeading({ eyebrow, title, description, action }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action && <div className="heading-action">{action}</div>}</div>;
}

export function ErrorNotice({ message, onRetry }) {
  return <div className="notice notice-error" role="alert"><AlertCircle size={18} /><span>{message}</span>{onRetry && <button className="text-button" onClick={onRetry}>Try again</button>}</div>;
}

export function Loading({ label = "Loading…" }) {
  return <div className="loading-state"><LoaderCircle className="spin" size={21} /><span>{label}</span></div>;
}

export function EmptyState({ title, message, icon: Icon = ShieldAlert, action }) {
  return <div className="empty-state"><span className="empty-icon"><Icon size={22} /></span><h3>{title}</h3><p>{message}</p>{action}</div>;
}

export function RiskBadge({ level }) {
  const normalized = (level || "unknown").toLowerCase();
  return <span className={`risk-badge risk-${normalized}`}><span className="risk-dot" />{level || "Unknown"}</span>;
}

export function ScoreRing({ score }) {
  const safeScore = Math.min(100, Math.max(0, Number(score) || 0));
  return <div className="score-ring" style={{ "--score": `${safeScore * 3.6}deg` }} role="img" aria-label={`Risk score ${safeScore} out of 100`}>
    <div className="score-ring-inner"><strong>{safeScore}</strong><span>of 100</span></div>
  </div>;
}

export function IndicatorIcon({ severity }) {
  return severity === "high" ? <ShieldAlert size={17} /> : <Check size={17} />;
}
