import ROSTER from "../../shared/knights.js";
import { ORDER_NAME } from "../data/content.js";
import { useProgress } from "../lib/useProgress.js";

const ORDERS = ["sword", "battle", "crown", "flame", "serpent"];

export default function Knights() {
  const done = useProgress();
  return (
    <>
      <p className="kicker">The roster</p>
      <h1>Knights of Westmarch</h1>
      <p className="lede">The {ROSTER.length} named Knights who lead warbands in Court of Blades and Banners, with whether each has sent in a signature ability.</p>
      {ORDERS.map((o) => (
        <section key={o}>
          <h2>{ORDER_NAME[o]}</h2>
          <div className="grid">
            {ROSTER.filter((k) => k.order === o).map((k) => (
              <article key={k.slug} className={`card order o-${k.order}`}>
                <div className="ordlab">{ORDER_NAME[k.order]}</div>
                <div className="kname">{k.name}</div>
                <p className="muted" style={{ margin: ".1rem 0 .5rem", fontFamily: "var(--sans)", fontSize: ".9rem" }}>{k.park}{k.guest ? ` · ${k.kingdom}` : ""} · Belted {k.belted}</p>
                {k.guest && <p className="ordlab" style={{ margin: "0 0 .4rem" }}>Guest Knight of note</p>}
                {done[k.slug] ? <span className="submitted">Ability submitted</span> : <span className="waiting">Waiting for their ability</span>}
              </article>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
