// Minimal ORK3 JSON client.
//
// ORK's JsonServer maps each service method's PHP parameter by name. Every
// method we call is declared as Method($request), so the arguments must arrive
// as one field called "request". We POST them as PHP array fields:
//   call=Authorization/Authorize&request[UserName]=...&request[Password]=...
// Passwords only ever travel in the POST body, never in a URL.
//
// The ORK key is sent in the X-Ork-Key header and the client name in X-ORK-Client.
// Set ORK_API_KEY in Netlify (Functions scope, secret); never commit the key.

export const ORK_URL = process.env.ORK_BASE || "https://ork.amtgard.com/orkservice/Json/index.php";

export function orkHeaders(env = process.env) {
  const h = {
    Accept: "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
    "X-ORK-Client": env.ORK_CLIENT || "Court of Blades and Banners/1.0",
  };
  if (env.ORK_API_KEY) h[env.ORK_API_KEY_HEADER || "X-Ork-Key"] = env.ORK_API_KEY;
  return h;
}

export function orkBody(call, params = {}) {
  const body = new URLSearchParams({ call });
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) body.append(`request[${k}]`, String(v));
  }
  return body;
}

export class OrkError extends Error {
  constructor(message, kind, detail) { super(message); this.kind = kind; this.detail = detail; }
}

export async function orkPost(call, params = {}, { fetchImpl = fetch, env = process.env } = {}) {
  const res = await fetchImpl(env.ORK_BASE || ORK_URL, { method: "POST", headers: orkHeaders(env), body: orkBody(call, params) });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    // ORK prints parameter errors as plain text before its JSON, and Cloudflare
    // answers blocked clients with an HTML challenge page. Tell those apart.
    const start = text.indexOf("{");
    if (start > 0) {
      try {
        const parsed = JSON.parse(text.slice(start));
        parsed.__prefix = text.slice(0, start).trim().slice(0, 300);
        return parsed;
      } catch { /* fall through */ }
    }
    const cloudflare = /just a moment|cf-chl|cloudflare/i.test(text);
    throw new OrkError(
      cloudflare ? "The ORK's firewall blocked the request" : `The ORK returned an unreadable response (HTTP ${res.status})`,
      cloudflare ? "blocked" : "unreadable",
      { status: res.status, snippet: text.slice(0, 200) }
    );
  }
}

export const orkOk = (r) => r && r.Status && Number(r.Status.Status) === 0;
