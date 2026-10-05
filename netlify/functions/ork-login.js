// POST /api/ork-login {username, password}
// 1. Authorization/Authorize with the ORK login (POST body only).
// 2. Player/GetPlayer for the persona, then DestroySession straight away.
// 3. Match the player to the Knights roster and mint a Firebase custom token
//    for uid ork_<MundaneId> with claims orkId, persona, knightSlug, admin.
// The password is never stored or logged.
import { orkPost, orkOk } from "./lib/orkClient.js";
import { mintCustomToken } from "./lib/firebaseToken.js";
import { isBlocked, recordFailure, clearUser, blobStore } from "./lib/throttle.js";
import { matchKnight, adminIds } from "./lib/roster.js";

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

export function originAllowed(origin, env = process.env) {
  if (!origin) return false;
  const allowed = [env.URL, env.DEPLOY_PRIME_URL, env.DEPLOY_URL, ...(env.ALLOWED_ORIGINS || "").split(",")]
    .map((s) => (s || "").trim().replace(/\/$/, ""))
    .filter(Boolean);
  if (env.CONTEXT === "dev" || env.NETLIFY_DEV === "true") allowed.push("http://localhost:8888", "http://localhost:5173");
  return allowed.includes(origin.replace(/\/$/, ""));
}

export async function handleLogin(req, { env = process.env, fetchImpl = fetch, store, ip = "unknown" } = {}) {
  if (req.method !== "POST") return json(405, { error: "Use POST." });
  if (!originAllowed(req.headers.get("origin"), env)) return json(403, { error: "This sign-in only works from the Court of Blades site." });

  let body;
  try { body = await req.json(); } catch { return json(400, { error: "Send your ORK username and password." }); }
  const username = String(body.username || "").trim();
  const password = String(body.password || "");
  if (!username || !password || username.length > 100 || password.length > 200) return json(400, { error: "Enter your ORK username and password." });

  if (await isBlocked(store, { username, ip })) {
    return json(429, { error: "Too many failed attempts. Wait 15 minutes and try again." });
  }

  let token;
  try {
    const auth = await orkPost("Authorization/Authorize", { UserName: username, Password: password, Client: env.ORK_CLIENT || "Court of Blades and Banners/1.0" }, { fetchImpl, env });
    if (!orkOk(auth) || !auth.Token || !auth.UserId) {
      await recordFailure(store, { username, ip });
      return json(401, { error: "The ORK didn't accept that username and password." });
    }
    token = auth.Token;
    const orkId = Number(auth.UserId);
    const player = await orkPost("Player/GetPlayer", { MundaneId: String(orkId), Token: token }, { fetchImpl, env });
    const persona = (player && player.Player && player.Player.Persona) || "";
    await clearUser(store, username);

    const knight = matchKnight({ orkId, persona });
    const admin = adminIds(env).includes(orkId);
    const claims = { orkId, persona, knightSlug: knight ? knight.slug : "", admin };
    const customToken = mintCustomToken({ clientEmail: env.FIREBASE_CLIENT_EMAIL, privateKey: env.FIREBASE_PRIVATE_KEY, uid: `ork_${orkId}`, claims });
    return json(200, { customToken, persona, orkId, knightSlug: claims.knightSlug, admin });
  } catch (e) {
    return json(502, { error: "Couldn't reach the ORK right now. Try again in a minute." });
  } finally {
    if (token) {
      try { await orkPost("Authorization/DestroySession", { Token: token }, { fetchImpl, env }); } catch { /* best effort */ }
    }
  }
}

export default async (req, context) => handleLogin(req, { store: await blobStore(), ip: context?.ip || "unknown" });

export const config = { path: "/api/ork-login" };
