import { useState } from "react";
import ROSTER from "../../shared/knights.js";
import { ORDER_NAME } from "../data/content.js";
import { useProgress } from "../lib/useProgress.js";

const ORDERS = ["sword", "battle", "crown", "flame", "serpent"];
const CORE = ROSTER.filter((k) => !k.expansion);
const BLACKTHORNE = ROSTER.filter((k) => k.expansion === "crystal-grove");

// The Knight's ORK heraldry, served through /api/ork-image. Falls back to an order shield.
function Heraldry({ k }) {
  const [failed, setFailed] = useState(!k.orkId);
  if (failed) {
    return (
      <div className="herald fallback" aria-hidden="true">
        <svg viewBox="0 0 20 24"><path d="M10 1.5l7.5 2.8v6.6c0 5.6-3.7 9.6-7.5 11.6-3.8-2-7.5-6-7.5-11.6V4.3z" fill="currentColor" /></svg>
      </div>
    );
  }
  if (k.portrait) {
    return <img className="herald portrait" src={k.portrait} alt={`Portrait of ${k.name}`} loading="lazy" decoding="async" width="64" height="64" onError={() => setFailed(true)} />;
  }
  return (
    <img className="herald" src={`/api/ork-image?id=${k.orkId}&kind=heraldry`} alt={`${k.name}'s heraldry`}
      loading="lazy" decoding="async" width="64" height="64" onError={() => setFailed(true)} />
  );
}

function Signature({ s }) {
  return (
    <div className="sig">
      <div className="ordlab">Signature · {s.when}</div>
      <div className="signame">{s.name} <q>{s.quote}</q></div>
      {s.loadout && <p className="muted"><b>Loadout:</b> {s.loadout}</p>}
      <ul>{s.rules.map((r) => <li key={r}>{r}</li>)}</ul>
      {s.upgrade && <p className="muted"><b>Upgrade, {s.upgrade[0]}:</b> {s.upgrade[1]}</p>}
    </div>
  );
}

function KnightCard({ k, done }) {
  return (
    <article className={`card order o-${k.order}${k.signature ? " has-sig" : ""}`}>
      <div className="khead">
        <Heraldry k={k} />
        <div>
          <div className="ordlab">{ORDER_NAME[k.order]}</div>
          <div className="kname">{k.name}</div>
        </div>
      </div>
      <p className="muted" style={{ margin: ".1rem 0 .5rem", fontFamily: "var(--sans)", fontSize: ".9rem" }}>{k.park}{k.guest || k.expansion ? ` · ${k.kingdom}` : ""}{k.belted ? ` · Belted ${k.belted}` : ""}</p>
      {k.guest && <p className="ordlab" style={{ margin: "0 0 .4rem" }}>Guest Knight of note</p>}
      {k.note && <p className="muted" style={{ margin: "0 0 .4rem", fontFamily: "var(--sans)", fontSize: ".85rem" }}>{k.note}</p>}
      {k.signature ? <Signature s={k.signature} /> : done[k.slug] ? <span className="submitted">Ability submitted · in review</span> : <span className="waiting">Waiting for their ability</span>}
    </article>
  );
}

export default function Knights() {
  const done = useProgress();
  const ready = ROSTER.filter((k) => k.signature).length;
  return (
    <>
      <p className="kicker">The roster</p>
      <h1>Knights of Westmarch</h1>
      <p className="lede">The {CORE.length} named Knights who lead warbands in Court of Blades and Banners. {ready} signature abilit{ready === 1 ? "y is" : "ies are"} in the rules so far; heraldry comes from each Knight's ORK profile.</p>
      {ORDERS.map((o) => (
        <section key={o}>
          <h2>{ORDER_NAME[o]}</h2>
          <div className="grid">
            {CORE.filter((k) => k.order === o).map((k) => <KnightCard key={k.slug} k={k} done={done} />)}
          </div>
        </section>
      ))}
      {BLACKTHORNE.length > 0 && (
        <section className="expansion">
          <p className="kicker">Expansion · Invasion of the Crystal Grove</p>
          <h2>Knights of Blackthorne</h2>
          <p className="lede">Kingdom of the Crystal Groves. They lead the invasion in the expansion and can sign in to write their own signature abilities. <a href="/rules/#crystal-grove">Read the expansion rules</a>.</p>
          <div className="grid">
            {BLACKTHORNE.map((k) => <KnightCard key={k.slug} k={k} done={done} />)}
          </div>
        </section>
      )}
    </>
  );
}
