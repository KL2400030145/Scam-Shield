import { useEffect, useState } from "react";
import { ArrowRight, Activity, ScanLine, ShieldAlert, ShieldCheck, TriangleAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../api";
import { EmptyState, ErrorNotice, Loading, PageHeading, RiskBadge } from "../components/Shared";

const COLORS = { Low: "#41c7a6", Medium: "#e8b450", High: "#ed7481" };
const shortDate = (value) => new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [trend, setTrend] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  async function load() {
    setLoading(true); setError("");
    try { const [stats, trends] = await Promise.all([api.stats(), api.trends()]); setData(stats); setTrend(trends); } catch (e) { setError(e.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  const counts = data?.riskCounts || data?.risk_counts || { Low: 0, Medium: 0, High: 0 };
  const total = data?.totalScans ?? data?.total_scans ?? 0;
  const recent = data?.recentScans || data?.recent_scans || [];
  const distribution = ["Low", "Medium", "High"].map((name) => ({ name, value: counts[name] || 0 })).filter((d) => d.value);
  const activity = (trend?.points || trend?.items || []).map((point) => ({ ...point, dateLabel: shortDate(point.date) }));

  return <div className="dashboard-page">
    <PageHeading eyebrow="YOUR WORKSPACE" title="Overview" description="A snapshot of the opportunities you've chosen to screen." action={<Link to="/analyze" className="button button-primary"><ScanLine size={16} /> New analysis <ArrowRight size={15} /></Link>} />
    {error && <ErrorNotice message={error} onRetry={load} />}
    {loading ? <Loading label="Loading your scan statistics…" /> : <>
      <div className="stat-grid">
        <StatCard icon={Activity} label="Total scans" value={total} accent="blue" />
        <StatCard icon={ShieldCheck} label="Low estimated risk" value={counts.Low || 0} accent="green" />
        <StatCard icon={TriangleAlert} label="Medium estimated risk" value={counts.Medium || 0} accent="amber" />
        <StatCard icon={ShieldAlert} label="High estimated risk" value={counts.High || 0} accent="red" />
      </div>
      {total === 0 ? <div className="panel dashboard-empty-panel"><EmptyState title="Your dashboard starts with your first scan" message="Only analyses you choose to save appear here. There are no sample or fabricated metrics." icon={Activity} action={<Link to="/analyze" className="button button-primary">Analyze an opportunity <ArrowRight size={15} /></Link>} /></div> : <>
        <div className="chart-grid">
          <section className="panel chart-panel"><div className="chart-heading"><div><h2>Risk distribution</h2><p>Saved scans by estimated risk category</p></div><span className="chart-caption">{total} total</span></div><div className="chart-wrap">{distribution.length ? <ResponsiveContainer width="100%" height={235}><PieChart><Pie data={distribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={65} outerRadius={92} paddingAngle={5}>{distribution.map((entry) => <Cell key={entry.name} fill={COLORS[entry.name]} />)}</Pie><Tooltip contentStyle={{ background: "#111d2d", border: "1px solid #26354a", borderRadius: 10, color: "#eaf0f7" }} /></PieChart></ResponsiveContainer> : <p className="chart-empty">No risk categories to chart.</p>}</div><div className="chart-legend">{["Low", "Medium", "High"].map((key) => <span key={key}><i style={{ background: COLORS[key] }} />{key}<b>{counts[key] || 0}</b></span>)}</div></section>
          <section className="panel chart-panel"><div className="chart-heading"><div><h2>Scan activity</h2><p>Saved analyses over the last 14 days</p></div><span className="chart-caption">14 DAYS</span></div><div className="chart-wrap">{activity.some((p) => p.count > 0) ? <ResponsiveContainer width="100%" height={235}><BarChart data={activity} margin={{ top: 14, right: 4, bottom: 0, left: -22 }}><CartesianGrid stroke="#1d2b3d" vertical={false} /><XAxis dataKey="dateLabel" tick={{ fill: "#8594a7", fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fill: "#8594a7", fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: "#111d2d", border: "1px solid #26354a", borderRadius: 10, color: "#eaf0f7" }} /><Bar dataKey="count" name="Scans" fill="#6d8eff" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer> : <div className="chart-empty">No scan activity during this period.</div>}</div></section>
        </div>
        <section className="panel recent-panel"><div className="chart-heading"><div><h2>Recent scans</h2><p>Your latest saved opportunity checks</p></div><Link to="/history" className="subtle-link">View history <ArrowRight size={14} /></Link></div><RecentRows scans={recent} /></section>
      </>}
    </>}
  </div>;
}

function StatCard({ icon: Icon, label, value, accent }) {
  return <div className="panel stat-card"><span className={`stat-icon stat-${accent}`}><Icon size={18} /></span><span className="stat-label">{label}</span><strong className="stat-value">{value}</strong><span className="stat-foot">Actual saved records</span></div>;
}

function RecentRows({ scans }) {
  if (!scans.length) return <p className="recent-empty">No saved scans yet.</p>;
  return <div className="recent-list">{scans.slice(0, 5).map((scan) => <div className="recent-row" key={scan.id}><span className="recent-date">{shortDate(scan.createdAt || scan.created_at)}</span><span className="recent-preview">{scan.preview || scan.textPreview || scan.text_preview || "Saved opportunity scan"}</span><RiskBadge level={scan.riskLevel || scan.risk_level} /><span className="recent-score">{scan.riskScore ?? scan.risk_score}<small>/100</small></span></div>)}</div>;
}
