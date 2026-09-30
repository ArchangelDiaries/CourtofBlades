import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { collection, deleteDoc, doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { useSession } from "../lib/session.jsx";
import { ORDER_NAME, REVIEW } from "../data/content.js";
import ROSTER from "../../shared/knights.js";

const FIELDS = [["known", "Known for"], ["style", "Style"], ["effect", "Ability should"], ["freq", "How often"], ["desc", "Description"], ["quote", "Battle cry"], ["art", "Art notes"]];

export default function Admin() {
  const s = useSession();
  const [rows, setRows] = useState([]);
  const [reqs, setReqs] = useState([]);
  const [filter, setFilter] = useState("all");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    if (!s.isAdmin || !db) return;
    const a = onSnapshot(collection(db, "responses"), (snap) => setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), () => {});
    const b = onSnapshot(collection(db, "requests"), (snap) => setReqs(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), () => {});
    return () => { a(); b(); };
  }, [s.isAdmin]);

  const bySlug = useMemo(() => Object.fromEntries(rows.map((r) => [r.slug || r.id, r])), [rows]);
  if (!s.ready) return <p className="muted">Loading…</p>;
  if (!s.isAdmin) return <p>This page is for the organizer. <Link to="/signin">Sign in</Link> with an organizer account.</p>;

  const submitted = rows.filter((r) => r.status === "submitted").length;
  const shown = rows
    .filter((r) => filter === "all" || (filter === "draft" ? r.status === "draft" : r.status === "submitted" && (r.reviewStatus || "new") === filter))
    .sort((x, y) => (y.updatedAt?.seconds || 0) - (x.updatedAt?.seconds || 0));

  async function copyAll() {
    const data = rows.map(({ uid, ...r }) => ({ ...r, updatedAt: r.updatedAt?.toDate?.().toISOString() || null, submittedAt: r.submittedAt?.toDate?.().toISOString() || null }));
    try { await navigator.clipboard.writeText(JSON.stringify(data, null, 2)); setCopied("Copied all entries as JSON."); }
    catch { setCopied("Your browser blocked copying. Use Download CSV instead."); }
  }
  function downloadCsv() {
    const cols = ["knight", "status", "reviewStatus", "aname", "desc", "style", "effect", "freq", "known", "quote", "art", "ok", "adminNotes"];
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "knight-abilities.csv" });
    a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <>
      <p className="kicker">Organizer</p>
      <h1>Review abilities</h1>
      <p className="lede">{submitted} of {ROSTER.length} Knights have submitted. {rows.length - submitted > 0 && `${rows.length - submitted} more have a draft saved.`}</p>
      <div className="row" style={{ margin: "1rem 0" }}>
        <button className="btn ghost small" onClick={copyAll}>Copy all as JSON</button>
        <button className="btn ghost small" onClick={downloadCsv}>Download CSV</button>
        {copied && <span className="msg ok">{copied}</span>}
      </div>

      {reqs.length > 0 && (
        <>
          <h2>Link requests</h2>
          <p className="muted">These players signed in but didn't match the roster automatically.</p>
          <div className="grid">{reqs.map((r) => <LinkRequest key={r.id} r={r} />)}</div>
        </>
      )}

      <h2>Entries</h2>
      <div className="row" role="group" aria-label="Filter entries">
        {[["all", "All"], ["new", "New"], ["reviewed", "Reviewed"], ["balanced", "Balanced"], ["inbook", "In the rulebook"], ["draft", "Drafts"]].map(([v, l]) => (
          <button key={v} className={`btn small ${filter === v ? "" : "ghost"}`} aria-pressed={filter === v} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>
      <div style={{ display: "grid", gap: ".6rem", marginTop: "1rem" }}>
        {shown.length === 0 && <p className="muted">No entries here yet.</p>}
        {shown.map((r) => <Entry key={r.id} r={r} />)}
      </div>

      <h2>Roster</h2>
      <div className="table">
        <table>
          <thead><tr><th>Knight</th><th>Order</th><th>ORK #</th><th>Entry</th></tr></thead>
          <tbody>{ROSTER.map((k) => {
            const r = bySlug[k.slug];
            return <tr key={k.slug}><td>{k.name}</td><td>{ORDER_NAME[k.order]}</td><td>{k.orkId}</td><td>{r ? (r.status === "submitted" ? <span className={`chip ${r.reviewStatus || "new"}`}>{REVIEW[r.reviewStatus || "new"]}</span> : "Draft") : <span className="muted">Nothing yet</span>}</td></tr>;
          })}</tbody>
        </table>
      </div>
    </>
  );
}

function Entry({ r }) {
  const [notes, setNotes] = useState(r.adminNotes || "");
  const [saved, setSaved] = useState("");
  const review = r.reviewStatus || "new";
  const k = ROSTER.find((x) => x.slug === r.slug);
  async function patch(data) {
    try { await updateDoc(doc(db, "responses", r.id), data); setSaved("Saved"); setTimeout(() => setSaved(""), 1500); }
    catch { setSaved("Couldn't save"); }
  }
  return (
    <details className="entry">
      <summary>
        <strong>{r.knight}</strong>
        <span className="muted">{k ? ORDER_NAME[k.order] : ""}</span>
        <span>{r.aname || <em className="muted">Unnamed</em>}</span>
        {r.status === "submitted" ? <span className={`chip ${review}`}>{REVIEW[review]}</span> : <span className="chip next">Draft</span>}
        {!r.ok && r.status === "submitted" && <span className="chip collecting">No permission</span>}
      </summary>
      <dl>{FIELDS.map(([f, l]) => <div key={f} style={{ display: "contents" }}><dt>{l}</dt><dd>{r[f] || "—"}</dd></div>)}
        <dt>Permission</dt><dd>{r.ok ? "Yes" : "Not given"}</dd>
        <dt>Updated</dt><dd>{r.updatedAt?.toDate ? r.updatedAt.toDate().toLocaleString() : "—"}</dd>
      </dl>
      <div className="row">
        <label className="field" style={{ fontWeight: 400 }}>Review status
          <select value={review} onChange={(e) => patch({ reviewStatus: e.target.value })}>
            {Object.entries(REVIEW).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select></label>
      </div>
      <label className="field" style={{ marginTop: ".6rem" }}>Your notes (only you see these)
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => notes !== (r.adminNotes || "") && patch({ adminNotes: notes })} /></label>
      {saved && <span className="msg ok">{saved}</span>}
    </details>
  );
}

function LinkRequest({ r }) {
  const [slug, setSlug] = useState(r.claimedSlug || "");
  const [msg, setMsg] = useState("");
  async function link() {
    try {
      await setDoc(doc(db, "links", r.uid), { slug, orkId: r.orkId || 0, persona: r.persona || "" });
      await deleteDoc(doc(db, "requests", r.id));
    } catch { setMsg("Couldn't link. Try again."); }
  }
  return (
    <div className="card">
      <h3>{r.persona || "Unknown persona"}</h3>
      <p className="muted" style={{ margin: "0 0 .5rem", fontFamily: "var(--sans)", fontSize: ".9rem" }}>ORK #{r.orkId || "?"}{r.note ? ` · "${r.note}"` : ""}</p>
      <select value={slug} onChange={(e) => setSlug(e.target.value)} aria-label="Knight to link">
        <option value="">Choose a Knight…</option>
        {ROSTER.map((k) => <option key={k.slug} value={k.slug}>{k.name}</option>)}
      </select>
      <div className="row" style={{ marginTop: ".6rem" }}>
        <button className="btn small" disabled={!slug} onClick={link}>Link account</button>
        <button className="btn ghost small" onClick={() => deleteDoc(doc(db, "requests", r.id))}>Dismiss</button>
      </div>
      {msg && <p className="msg err">{msg}</p>}
    </div>
  );
}
