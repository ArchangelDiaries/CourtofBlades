import { NavLink, Route, Routes, Link } from "react-router-dom";
import { useSession } from "./lib/session.jsx";
import { configured } from "./firebase.js";
import Overview from "./pages/Overview.jsx";
import Knights from "./pages/Knights.jsx";
import SignIn from "./pages/SignIn.jsx";
import Ability from "./pages/Ability.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  const s = useSession();
  return (
    <>
      <header className="top">
        <div className="shell">
          <Link to="/" className="brand">Court of Blades and Banners</Link>
          <nav className="nav" aria-label="Main">
            <NavLink to="/" end>Overview</NavLink>
            <NavLink to="/knights">Knights</NavLink>
            <a href="/rules/">Rules</a>
            <NavLink to="/ability">Your ability</NavLink>
            {s.isAdmin && <NavLink to="/admin">Review</NavLink>}
          </nav>
          <div className="who">
            {s.user ? (
              <>
                <span>{s.persona || "Signed in"}</span>
                <button className="btn ghost small" onClick={s.signOut}>Sign out</button>
              </>
            ) : (
              <Link className="btn small" to="/signin">Sign in</Link>
            )}
          </div>
        </div>
      </header>
      <main className="shell">
        {!configured && (
          <p className="notice">Firebase isn't configured for this build yet. Add the VITE_FB_* settings in Netlify and redeploy.</p>
        )}
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/knights" element={<Knights />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/ability" element={<Ability />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<p>That page doesn't exist. <Link to="/">Go to the overview</Link>.</p>} />
        </Routes>
      </main>
      <footer>
        <div className="shell">Court of Blades and Banners · a skirmish game of the Kingdom of Westmarch · build {__BUILD_TIME__}</div>
      </footer>
    </>
  );
}
