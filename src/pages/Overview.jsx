import { Link } from "react-router-dom";
import { STATUS, STATE_LABEL, FEATURES } from "../data/content.js";
import { useProgress } from "../lib/useProgress.js";
import ROSTER from "../../shared/knights.js";

export default function Overview() {
  const done = useProgress();
  const count = Object.keys(done).filter((s) => ROSTER.some((k) => k.slug === s)).length;
  const rulebook = import.meta.env.VITE_RULEBOOK_URL;
  return (
    <>
      <p className="kicker">In production · Kingdom of Westmarch</p>
      <h1>Court of Blades and Banners</h1>
      <p className="lede">A tabletop skirmish game of Amtgard. Muster Warriors, Wizards and Healers under the named Knights and Paragons of Westmarch, and fight the battlegames you know from the park, down to the lost limb and the walk back from Nirvana.</p>
      <div className="row" style={{ marginTop: "1.5rem" }}>
        <Link className="btn" to="/ability">Knights: submit your ability</Link>
        {rulebook && <a className="btn ghost" href={rulebook} target="_blank" rel="noreferrer">Read the playtest rules</a>}
      </div>

      <h2>Where the game stands</h2>
      <p className="muted">The rules are written and heading into playtesting. Right now we're gathering signature abilities from the Knights: <strong>{count} of {ROSTER.length}</strong> have submitted.</p>
      <ul className="status">
        {STATUS.map((s) => (
          <li key={s.area}>
            <span><span className={`chip ${s.state}`}>{STATE_LABEL[s.state]}</span></span>
            <div><h3>{s.area}</h3><p>{s.note}</p></div>
          </li>
        ))}
      </ul>

      <h2>What makes it Amtgard</h2>
      <div className="grid">
        {FEATURES.map((f) => (
          <div className="card" key={f.title}><h3>{f.title}</h3><p style={{ margin: 0 }}>{f.text}</p></div>
        ))}
      </div>

      <h2>Knights: how to take part</h2>
      <ol className="steps">
        <li><div><h3>Sign in with your ORK account</h3><p className="muted" style={{ margin: 0 }}>The same username and password you use on the ORK. We check your ORK number against the Knights roster so only you can write your entry.</p></div></li>
        <li><div><h3>Answer ten quick questions</h3><p className="muted" style={{ margin: 0 }}>Your fighting style, what your ability does, and how it works in your own words. A live preview shows your datasheet as you go.</p></div></li>
        <li><div><h3>Submit, then edit any time</h3><p className="muted" style={{ margin: 0 }}>Elaina balances every ability into game rules and will check with you before it goes in the book.</p></div></li>
      </ol>
      <p><Link to="/knights">See the Knights roster</Link></p>
    </>
  );
}
