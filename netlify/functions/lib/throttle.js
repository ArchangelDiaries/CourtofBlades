// Failed-login throttle. The ORK has no lockout of its own, so this site adds one:
// 5 failures per username and 20 per IP in 15 minutes.
export const WINDOW_MS = 15 * 60 * 1000;
export const LIMITS = { user: 5, ip: 20 };

export function memoryStore() {
  const m = new Map();
  return {
    async get(k) { return m.has(k) ? JSON.parse(m.get(k)) : null; },
    async set(k, v) { m.set(k, JSON.stringify(v)); },
    async delete(k) { m.delete(k); },
  };
}

export async function blobStore() {
  const { getStore } = await import("@netlify/blobs");
  const s = getStore("ork-login");
  return {
    async get(k) { return s.get(k, { type: "json" }); },
    async set(k, v) { await s.setJSON(k, v); },
    async delete(k) { await s.delete(k); },
  };
}

const keyFor = (kind, id) => `${kind}:${String(id || "unknown").toLowerCase().slice(0, 120)}`;

async function count(store, key, now) {
  const rec = await store.get(key);
  if (!rec || now - rec.first > WINDOW_MS) return { n: 0, first: now };
  return rec;
}

export async function isBlocked(store, { username, ip }, now = Date.now()) {
  const u = await count(store, keyFor("user", username), now);
  const i = await count(store, keyFor("ip", ip), now);
  return u.n >= LIMITS.user || i.n >= LIMITS.ip;
}

export async function recordFailure(store, { username, ip }, now = Date.now()) {
  for (const [kind, id] of [["user", username], ["ip", ip]]) {
    const key = keyFor(kind, id);
    const rec = await count(store, key, now);
    await store.set(key, { n: rec.n + 1, first: rec.first });
  }
}

export async function clearUser(store, username) {
  await store.delete(keyFor("user", username));
}
