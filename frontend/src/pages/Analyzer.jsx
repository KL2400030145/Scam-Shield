import { useState } from "react";
import { ArrowRight, Check, CircleHelp, FileText, RotateCcw, Save, ShieldAlert } from "lucide-react";
import { api } from "../api";
import { ErrorNotice, IndicatorIcon, Loading, PageHeading, RiskBadge, ScoreRing } from "../components/Shared";

const MAX_CHARS = 20000;

export default function Analyzer() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function analyze(event) {
    event.preventDefault();
    setError("");
    if (!text.trim()) { setError("Paste a job description or recruiter message before analyzing."); return; }
    if (text.trim().length < 30) { setError("Please include at least 30 characters so the screening has useful context."); return; }
    setBusy(true); setResult(null); setSaved(false);
    try { setResult(await api.analyze(text.trim())); } catch (e) { setError(e.message); } finally { setBusy(false); }
  }

  async function save() {
    setError(""); setBusy(true);
    try { setResult(await api.saveScan(text.trim())); setSaved(true); } catch (e) { setError(e.message); } finally { setBusy(false); }
  }

  return <div className="analyzer-page">
    <PageHeading eyebrow="OPPORTUNITY CHECK" title="Analyze a job" description="Review a job post, internship listing, or recruiter message for contextual risk signals." />
    <div className="analyzer-grid">
      <section className="panel analyzer-input-panel">
        <div className="panel-heading"><div><span className="panel-icon"><FileText size={17} /></span><div><h2>Opportunity details</h2><p>Paste the text you'd like to screen.</p></div></div><span className="privacy-label"><ShieldAlert size={13} /> Private until saved</span></div>
        <form onSubmit={analyze}>
          <label htmlFor="job-text" className="field-label">Job description or message</label>
          <textarea id="job-text" value={text} maxLength={MAX_CHARS} onChange={(e) => { setText(e.target.value); setError(""); }} placeholder="Paste the job description, internship post, or recruitment email here…" aria-describedby="input-help char-count" />
          <div className="textarea-meta"><span id="input-help">Remove personal details before pasting.</span><span id="char-count">{text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}</span></div>
          {error && <ErrorNotice message={error} />}
          <div className="form-actions"><button type="submit" className="button button-primary" disabled={busy}>{busy ? <><span className="button-spinner" /> Analyzing…</> : <>Analyze text <ArrowRight size={16} /></>}</button><button type="button" className="button button-outline" disabled={!text || busy} onClick={() => { setText(""); setResult(null); setError(""); setSaved(false); }}><RotateCcw size={15} /> Clear</button></div>
        </form>
        <div className="privacy-foot"><CircleHelp size={15} /><span>Your text is not stored by an analysis request. Select <b>Save to history</b> only if you want to keep it in your database.</span></div>
      </section>
      <section className={`panel result-panel ${result ? "has-result" : ""}`}>
        {!result && !busy && <div className="result-empty"><span className="result-empty-icon"><ShieldAlert size={24} /></span><h2>Your screening appears here</h2><p>Submit an opportunity to see its risk estimate, the signals detected, and practical next steps.</p><div className="result-empty-note"><CircleHelp size={15} /> An estimate is not proof of fraud or legitimacy.</div></div>}
        {busy && <Loading label="Reviewing the submitted text…" />}
        {result && <div className="result-content"><div className="result-title-row"><div><div className="eyebrow">SCREENING RESULT</div><h2>Review the signals</h2></div><RiskBadge level={result.riskLevel || result.risk_level} /></div>
          <div className="score-summary"><ScoreRing score={result.riskScore ?? result.risk_score} /><div><span className="score-label">ESTIMATED RISK SCORE</span><p>{result.summary || "This estimate reflects wording signals in the submitted text—not a verification of the employer or offer."}</p><span className="method-tag">{result.modelVersion || result.model_version || "rules-baseline-v1"}</span></div></div>
          <div className="result-section"><div className="result-section-title"><h3>Signals to consider</h3><span>{(result.indicators || []).length} found</span></div>{result.indicators?.length ? <ul className="indicator-list">{result.indicators.map((item) => <li key={item.code}><span className="indicator-icon"><IndicatorIcon severity={item.severity} /></span><div><strong>{item.title}</strong><p>{item.explanation}</p></div></li>)}</ul> : <div className="no-signals"><Check size={16} /> No configured warning patterns detected. This does not establish that the opportunity is safe.</div>}</div>
          <div className="recommendations"><h3><ShieldAlert size={16} /> Practical next steps</h3><ul>{(result.recommendations || []).map((tip, i) => <li key={i}>{tip}</li>)}</ul></div>
          <p className="result-disclaimer">{result.disclaimer || "Automated risk estimate only. ScamShield does not verify employers, websites, domains, or recruiter identities."}</p>
          <div className="save-row">{saved ? <span className="saved-confirm"><Check size={16} /> Saved to scan history</span> : <span>Analysis isn't saved unless you choose to keep it.</span>}<button className="button button-outline" onClick={save} disabled={busy || saved}><Save size={15} /> {saved ? "Saved" : "Save to history"}</button></div>
        </div>}
      </section>
    </div>
  </div>;
}
