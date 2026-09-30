import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.js";
import { useSession } from "../lib/session.jsx";
import { STYLES, EFFECTS, FREQS, ORDER_NAME, REVIEW } from "../data/content.js";
import ROSTER from "../../shared/knights.js";

const EMPTY = { known: "", style: "", effect: "", freq: "", aname: "", desc: "", quote: "", art: "", ok: false };

function Radios({ name, opts, value, onChange }) {
  return (
    <div className="opts">
      {opts.map(([t, sub], i) => (
        <label className="opt" key={t} htmlFor={`${name}-${i}`}>
          <input type="radio" id={`${name}-${i}`} name={name} value={t} checked={value === t} onChange={() => onChange(t)} />
          <span>{t}<small>{sub}</small></span>
        </label>
      ))}
    </div>
  );
}

export default function Ability() {
  const s = useSession();
  const [form, setForm] = useState(EMPTY);
  const [meta, setMeta] = useState({ status: "", review: "" });
  const [loaded, setLoaded] = useState(false);
  const [msg, setMsg] = useState({ kind: "", text: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!s.slug || !db) return;
    getDoc(doc(db, "responses", s.slug)).then((snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setForm({ ...EMPTY, ...Object.fromEntries(Object.keys(EMPTY).map((k) => [k, d[k] ?? EMPTY[k]])) });
        setMeta({ status: d.status || "", review: d.reviewStatus || "" });
      }
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, [s.slug]);

  if (!s.ready) return <p className="muted">Loading…</p>;
  if (!s.user) return (
    <>
      <p className="kicker">Knights of Westmarch</p>
      <h1>Your signature ability</h1>
      <p className="lede">Sign in with your ORK account to describe the ability that feels most like you on the field.</p>
      <p style={{ marginTop: "1.5rem" }}><Link className="btn" to="/signin">Sign in with ORK</Link></p>
    </>
  );
  if (!s.slug) return <Unmatched />;

  const k = s.knight;
  const set = (key) => (v) => setForm((f) => ({ ...f, [key]: typeof v === "string" || typeof v === "boolean" ? v : v.target.value }));

  async function save(status) {
    if (status === "submitted") {
      if (!form.aname.trim() || !form.desc.trim()) return setMsg({ kind: "err", text: "Name your ability and describe it before submitting." });
      if (!form.ok) return setMsg({ kind: "err", text: "Tick the permission box so your persona can appear in the game." });
    }
    setSaving(true); setMsg({ kind: "", text: "" });
    try {
      const clean = Object.fromEntries(Object.entries(form).map(([key, v]) => [key, typeof v === "string" ? v.trim() : v]));
      const body = { ...clean, slug: s.slug, knight: k.name, orkId: Number(s.claims.orkId || 0), uid: s.user.uid, status, updatedAt: serverTimestamp() };
      if (status === "submitted") body.submittedAt = serverTimestamp();
      await setDoc(doc(db, "responses", s.slug), body, { merge: true });
      if (status === "submitted") await setDoc(doc(db, "progress", s.slug), { submitted: true, at: serverTimestamp() });
      setMeta((m) => ({ ...m, status }));
      setMsg({ kind: "ok", text: status === "submitted" ? "Submitted. Thank you! You can come back and edit it any time." : "Draft saved." });
    } catch (e) {
      setMsg({ kind: "err", text: "Couldn't save just now. Check your connection and try again." });
    } finally { setSaving(false); }
  }

  return (
    <>
      <p className="kicker">{ORDER_NAME[k.order]}</p>
      <h1>Your signature ability</h1>
      <p className="lede">Welcome, {k.name}. Describe the ability that feels most like you on the field. Don't worry about numbers: Elaina turns every idea into balanced game rules.</p>
      {meta.status && (
        <p className="msg" style={{ marginTop: "1rem" }}>
          Status: <strong>{meta.status === "submitted" ? "Submitted" : "Draft"}</strong>
          {meta.review && <> · <span className={`chip ${meta.review}`}>{REVIEW[meta.review]}</span></>}
        </p>
      )}
      {!loaded ? <p className="muted">Loading your entry…</p> : (
        <div className="split" style={{ marginTop: "1.5rem" }}>
          <form className="q" onSubmit={(e) => { e.preventDefault(); save("submitted"); }}>
            <fieldset><legend>1. What are you known for on the field?</legend>
              <p className="hint">A sentence or two. What would people say about you in a battle?</p>
              <textarea id="known" maxLength={400} value={form.known} onChange={set("known")} /></fieldset>
            <fieldset><legend>2. Which style fits you best?</legend><Radios name="style" opts={STYLES} value={form.style} onChange={set("style")} /></fieldset>
            <fieldset><legend>3. What should your ability do?</legend><Radios name="effect" opts={EFFECTS} value={form.effect} onChange={set("effect")} /></fieldset>
            <fieldset><legend>4. How often should it happen?</legend><Radios name="freq" opts={FREQS} value={form.freq} onChange={set("freq")} /></fieldset>
            <fieldset><legend>5. Name your ability</legend>
              <p className="hint">Short enough for a card, like "Last One Standing".</p>
              <input type="text" id="aname" maxLength={40} value={form.aname} onChange={set("aname")} />
              <div className="count">{form.aname.length} / 40</div></fieldset>
            <fieldset><legend>6. Describe it in your own words</legend>
              <p className="hint">What happens when you use it? Tell the story; the dice come later.</p>
              <textarea id="desc" maxLength={600} value={form.desc} onChange={set("desc")} />
              <div className="count">{form.desc.length} / 600</div></fieldset>
            <fieldset><legend>7. A battle cry or quote (optional)</legend>
              <input type="text" id="quote" maxLength={120} value={form.quote} onChange={set("quote")} /></fieldset>
            <fieldset><legend>8. For your character art (optional)</legend>
              <p className="hint">Weapon, armor, colors, heraldry or garb for your player template graphic.</p>
              <textarea id="art" maxLength={400} value={form.art} onChange={set("art")} /></fieldset>
            <fieldset><legend>9. Permission</legend>
              <label className="opt" htmlFor="ok"><input type="checkbox" id="ok" checked={form.ok} onChange={(e) => set("ok")(e.target.checked)} />
                <span>I'm happy to appear as a named character, with my persona name, in Court of Blades and Banners.</span></label></fieldset>
            <div className="row">
              <button className="btn" disabled={saving}>{meta.status === "submitted" ? "Update my submission" : "Submit my ability"}</button>
              <button type="button" className="btn ghost" disabled={saving} onClick={() => save("draft")}>Save draft</button>
              {msg.text && <span className={`msg ${msg.kind}`} role="status">{msg.text}</span>}
            </div>
          </form>
          <Preview k={k} f={form} />
        </div>
      )}
    </>
  );
}

function Preview({ k, f }) {
  return (
    <aside className="preview">
      <p className="kicker" style={{ color: "var(--muted)" }}>Your datasheet preview</p>
      <div className={`sheet o-${k.order}`}>
        <div className="ordlab">{ORDER_NAME[k.order]}</div>
        <div className="kname">{k.name}</div>
        <p className="muted" style={{ margin: 0, fontFamily: "var(--sans)", fontSize: ".9rem" }}>{k.park} · Belted {k.belted}</p>
        <div className="sig">
          <div className="lab">Signature ability</div>
          <h3 style={{ fontStyle: f.aname ? "normal" : "italic", color: f.aname ? "inherit" : "var(--muted)" }}>{f.aname || "Unnamed ability"}</h3>
          <p style={{ margin: 0, color: f.desc ? "inherit" : "var(--muted)", fontStyle: f.desc ? "normal" : "italic" }}>{f.desc || "Your description will appear here."}</p>
          <div className="chips">{[f.style, f.effect, f.freq].filter(Boolean).map((t) => <span key={t}>{t}</span>)}</div>
        </div>
        {f.quote && <blockquote>"{f.quote.replace(/^"|"$/g, "")}"</blockquote>}
      </div>
      <p className="muted" style={{ fontSize: ".9rem", fontFamily: "var(--sans)" }}><strong>A good signature ability</strong> does one memorable thing, fits how you really fight, and is about as strong as a big once-per-game moment.</p>
    </aside>
  );
}

function Unmatched() {
  const s = useSession();
  const [claimed, setClaimed] = useState("");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  if (s.isAdmin) return <p>You're signed in as an organizer. Go to <Link to="/admin">Review</Link>.</p>;
  async function send(e) {
    e.preventDefault(); setErr("");
    try {
      await setDoc(doc(db, "requests", s.user.uid), { uid: s.user.uid, orkId: Number(s.claims.orkId || 0), persona: s.persona.slice(0, 120), claimedSlug: claimed, note: note.slice(0, 300), at: serverTimestamp() });
      setSent(true);
    } catch { setErr("Couldn't send that. Try again in a moment."); }
  }
  return (
    <div style={{ maxWidth: "36rem" }}>
      <h1>We couldn't find you on the roster</h1>
      <p className="lede">You're signed in as {s.persona || "an ORK player"}, but that account doesn't match one of the {ROSTER.length} Knights in the game. If you are one of them, ask to be linked and Elaina will connect your account.</p>
      {sent ? <p className="msg ok">Request sent. You'll be able to submit once Elaina links your account.</p> : (
        <form className="card" onSubmit={send} style={{ display: "grid", gap: ".8rem", marginTop: "1rem" }}>
          <label className="field">Which Knight are you?
            <select id="claim" value={claimed} onChange={(e) => setClaimed(e.target.value)} required>
              <option value="">Choose…</option>
              {ROSTER.map((k) => <option key={k.slug} value={k.slug}>{k.name}</option>)}
            </select></label>
          <label className="field">Anything Elaina should know? (optional)<textarea id="note" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} /></label>
          <button className="btn">Ask to be linked</button>
          {err && <p className="msg err">{err}</p>}
        </form>
      )}
    </div>
  );
}
