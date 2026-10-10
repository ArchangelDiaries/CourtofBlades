// GET /api/ork-image?id=<orkId>&kind=portrait|heraldry
// Serves a rostered Knight's ORK portrait or heraldry through this site, so the
// browser never has to reach the ORK (whose firewall can challenge visitors).
//  - Only the ORK numbers in shared/knights.js are served: this is not an open proxy.
//  - Images are fetched server-side with the ORK key headers, checked to be real
//    images under a size cap, and cached at Netlify's CDN for a week.
//  - portrait falls back to heraldry; a Knight with neither gets a 404 and the
//    page shows their order emblem instead.
import roster from "../../shared/knights.js";
import { orkPost, orkHeaders } from "./lib/orkClient.js";

const ORK_ORIGIN = "https://ork.amtgard.com";
const MAX_BYTES = 1_500_000;
const ALLOWED = new Set(roster.map((k) => Number(k.orkId)).filter(Boolean));
const pad6 = (id) => String(id).padStart(6, "0");

const notFound = () => new Response("No image", { status: 404, headers: { "Cache-Control": "public, max-age=3600", "Netlify-CDN-Cache-Control": "public, max-age=21600" } });

function sameOrkAsset(url) {
  try {
    const u = new URL(url, ORK_ORIGIN);
    // the ORK's shared default shield (000000) means "no heraldry uploaded"
    return u.origin === ORK_ORIGIN && u.pathname.startsWith("/assets/") && !/\/0{6}\./.test(u.pathname) ? u.href : null;
  } catch { return null; }
}

async function fetchImage(url, { fetchImpl, env }) {
  const safe = sameOrkAsset(url); if (!safe) return null;
  const h = orkHeaders(env); delete h["Content-Type"]; h.Accept = "image/png,image/jpeg,image/*;q=0.8";
  let res;
  try { res = await fetchImpl(safe, { headers: h, redirect: "follow" }); } catch { return null; }
  if (res.url && !sameOrkAsset(res.url)) return null; // never follow a redirect off the ORK
  const type = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  if (!res.ok || !/^image\/(png|jpeg|jpg|gif|webp)$/.test(type)) return null;
  const buf = new Uint8Array(await res.arrayBuffer());
  if (!buf.length || buf.length > MAX_BYTES) return null;
  return { buf, type };
}

async function heraldryCandidates(id, { fetchImpl, env }) {
  const list = [];
  try {
    const r = await orkPost("Heraldry/GetHeraldryUrl", { Type: "Player", Id: id }, { fetchImpl, env });
    if (r && r.Url) list.push(r.Url);
  } catch { /* fall back to the known paths */ }
  list.push(`${ORK_ORIGIN}/assets/heraldry/player/${pad6(id)}.png`, `${ORK_ORIGIN}/assets/heraldry/player/${pad6(id)}.jpg`);
  return list;
}

export async function handleImage(req, { env = process.env, fetchImpl = fetch } = {}) {
  if (req.method !== "GET" && req.method !== "HEAD") return new Response("Use GET.", { status: 405 });
  const q = new URL(req.url).searchParams;
  const id = Number(q.get("id"));
  const kind = q.get("kind") === "heraldry" ? "heraldry" : "portrait";
  if (!Number.isInteger(id) || !ALLOWED.has(id)) return notFound();

  const candidates = [];
  if (kind === "portrait") candidates.push(`${ORK_ORIGIN}/assets/players/${pad6(id)}.png`, `${ORK_ORIGIN}/assets/players/${pad6(id)}.jpg`);
  candidates.push(...await heraldryCandidates(id, { fetchImpl, env }));

  for (const url of [...new Set(candidates)]) {
    const img = await fetchImage(url, { fetchImpl, env });
    if (img) {
      return new Response(img.buf, { status: 200, headers: {
        "Content-Type": img.type,
        "Cache-Control": "public, max-age=86400",
        "Netlify-CDN-Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'",
      } });
    }
  }
  return notFound();
}

export default (req) => handleImage(req);

export const config = { path: "/api/ork-image" };
