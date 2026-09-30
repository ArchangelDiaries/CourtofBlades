import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useSession } from "../lib/session.jsx";

export default function SignIn() {
  const s = useSession();
  const nav = useNavigate();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  if (s.ready && s.user) return <Navigate to={s.isAdmin && !s.slug ? "/admin" : "/ability"} replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const r = await s.signInWithOrk(u, p);
      setP("");
      nav(r.admin && !r.knightSlug ? "/admin" : "/ability");
    } catch (x) { setErr(x.message); }
    finally { setBusy(false); }
  }

  return (
    <div style={{ maxWidth: "26rem" }}>
      <p className="kicker">Knights and organizers</p>
      <h1>Sign in</h1>
      <p className="muted">Use your ORK username and password. This site never stores your password; it asks the ORK who you are, then signs you in here.</p>
      <form className="card" onSubmit={submit} style={{ display: "grid", gap: ".8rem" }}>
        <label className="field">ORK username<input type="text" id="ork-user" autoComplete="username" value={u} onChange={(e) => setU(e.target.value)} required /></label>
        <label className="field">ORK password<input type="password" id="ork-pass" autoComplete="current-password" value={p} onChange={(e) => setP(e.target.value)} required /></label>
        <button className="btn" disabled={busy}>{busy ? "Checking with the ORK…" : "Sign in with ORK"}</button>
        {err && <p className="msg err" role="alert" style={{ margin: 0 }}>{err}</p>}
      </form>
      <p className="muted" style={{ fontSize: ".9rem", fontFamily: "var(--sans)" }}>
        Organizer? <button className="btn ghost small" onClick={() => s.signInWithGoogle().catch((x) => setErr(x.message))}>Sign in with Google</button>
      </p>
    </div>
  );
}
