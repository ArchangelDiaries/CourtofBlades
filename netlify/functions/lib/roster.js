import roster from "../../../shared/knights.js";

export const ROSTER = roster;

const norm = (s = "") => s.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();

// Match an ORK player to the Knights roster: ORK number first, persona name as a fallback.
export function matchKnight({ orkId, persona }) {
  const id = Number(orkId);
  return ROSTER.find((k) => k.orkId === id) || ROSTER.find((k) => norm(k.name) === norm(persona)) || null;
}

export function adminIds(env = process.env) {
  return String(env.ADMIN_ORK_IDS || "").split(/[,\s]+/).filter(Boolean).map(Number);
}
