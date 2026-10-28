import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Search, Trash2 } from "lucide-react";
import { api } from "../api";
import { EmptyState, ErrorNotice, Loading, PageHeading, RiskBadge } from "../components/Shared";

const fmtDate = (value) => new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export default function History() {
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [data, setData] = useState(null);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true); setError("");
    try { setData(await api.scans({ page, size: 10, riskLevel: filter || undefined, search: search || undefined })); } catch (e) { setError(e.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [page, filter, search]);

  async function openDetails(id) { setError(""); try { setDetail(await api.scan(id)); } catch (e) { setError(e.message); } }
  async function remove(id) {
    if (!window.confirm("Delete this saved scan? This will permanently remove its stored text and result.")) return;
    setError("");
    try { await api.deleteScan(id); setDetail(null); await load(); } catch (e) { setError(e.message); }
  }

  const scans = data?.content || [];
  const totalPages = data?.totalPages ?? data?.total_pages ?? 0;
  const totalElements = data?.totalElements ?? data?.total_elements ?? 0;
  return <div className="history-page">
    <PageHeading eyebrow="SAVED OPPORTUNITIES" title="Scan history" description="Review or remove analyses you chose to save." />
    {error && <ErrorNotice message={error} onRetry={load} />}
    <section className="panel history-panel">
      <div className="history-toolbar"><label className="search-input"><Search size={16} /><input aria-label="Search saved scans" value={search} onChange={(e) => { setPage(0); setSearch(e.target.value); }} placeholder="Search saved text…" /></label><label className="filter-select-label">Risk level<select aria-label="Filter by risk level" value={filter} onChange={(e) => { setPage(0); setFilter(e.target.value); }}><option value="">All levels</option><option>Low</option><option>Medium</option><option>High</option></select></label><span className="history-total">{totalElements} saved {totalElements === 1 ? "scan" : "scans"}</span></div>
      {loading ? <Loading label="Loading saved scans…" /> : scans.length ? <><div className="history-table-wrap"><table className="history-table"><thead><tr><th>OPPORTUNITY PREVIEW</th><th>ESTIMATED RISK</th><th>SCORE</th><th>DATE SAVED</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{scans.map((scan) => <tr key={scan.id}><td><button className="preview-button" onClick={() => openDetails(scan.id)}>{scan.preview || scan.textPreview || scan.text_preview || "Saved opportunity scan"}</button></td><td><RiskBadge level={scan.riskLevel || scan.risk_level} /></td><td className="table-score">{scan.riskScore ?? scan.risk_score}<span>/100</span></td><td className="table-date">{fmtDate(scan.createdAt || scan.created_at)}</td><td><button className="icon-button delete-button" aria-label="Delete scan" onClick={() => remove(scan.id)}><Trash2 size={16} /></button></td></tr>)}</tbody></table></div><div className="pagination"><span>Page {page + 1} of {Math.max(totalPages, 1)}</span><div><button className="icon-button" aria-label="Previous page" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}><ChevronLeft size={17} /></button><button className="icon-button" aria-label="Next page" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight size={17} /></button></div></div></> : <EmptyState title={search || filter ? "No matching scans" : "No saved scans yet"} message={search || filter ? "Try changing your search or filter." : "Your scans will show up here when you choose to save one."} icon={Search} />}
    </section>
    {detail && <div className="modal-backdrop" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) setDetail(null); }}><section className="panel detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title"><div className="detail-head"><div><div className="eyebrow">SAVED SCAN · {fmtDate(detail.createdAt || detail.created_at)}</div><h2 id="detail-title">Scan details</h2></div><button className="icon-button" aria-label="Close details" onClick={() => setDetail(null)}>×</button></div><div className="detail-meta"><RiskBadge level={detail.riskLevel || detail.risk_level} /><strong>{detail.riskScore ?? detail.risk_score}<small> / 100</small></strong></div><h3>Saved text</h3><pre className="saved-text">{detail.text}</pre><p className="result-disclaimer">The stored text is visible only on this history detail view. Delete the scan to remove it from the database.</p><button className="button button-danger" onClick={() => remove(detail.id)}><Trash2 size={15} /> Delete saved scan</button></section></div>}
  </div>;
}
