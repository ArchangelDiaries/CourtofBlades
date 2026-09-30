// Minimal ORK3 JSON client. ORK reads flat request fields from $_REQUEST,
// so every call is a POST of form fields: call=Class/Method plus parameters.
// Passwords only ever travel in the POST body, never in a URL.
//
// If FORK's netlify/functions/lib/orkClient.js sends the API key in a
// specific header, set ORK_API_KEY_HEADER to that header name (or copy
// FORK's file over this one; it exposes the same orkPost name).

export const ORK_URL = process.env.ORK_BASE || "https://ork.amtgard.com/orkservice/Json/index.php";

export function orkHeaders(env = process.env) {
  const h = {
    Accept: "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
    "X-ORK-Client": env.ORK_CLIENT || "Court of Blades/1.0",
  };
  if (env.ORK_API_KEY) h[env.ORK_API_KEY_HEADER || "X-ORK-API-Key"] = env.ORK_API_KEY;
  return h;
}

export async function orkPost(call, params = {}, { fetchImpl = fetch, env = process.env } = {}) {
  const body = new URLSearchParams({ call, ...params });
  const res = await fetchImpl(env.ORK_BASE || ORK_URL, { method: "POST", headers: orkHeaders(env), body });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`ORK returned an unreadable response (HTTP ${res.status})`);
  }
}

export const orkOk = (r) => r && r.Status && Number(r.Status.Status) === 0;
