import { describe, it, expect, beforeEach } from "vitest";
import crypto from "node:crypto";
import { handleLogin, originAllowed } from "../netlify/functions/ork-login.js";
import { memoryStore } from "../netlify/functions/lib/throttle.js";
import { matchKnight } from "../netlify/functions/lib/roster.js";
import roster from "../shared/knights.js";

const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
const PEM = privateKey.export({ type: "pkcs8", format: "pem" });
const ORIGIN = "https://court-of-blades.netlify.app";
const env = { URL: ORIGIN, FIREBASE_CLIENT_EMAIL: "svc@test.iam.gserviceaccount.com", FIREBASE_PRIVATE_KEY: PEM.replace(/\n/g, "\\n"), ADMIN_ORK_IDS: "999" };

function fakeOrk({ ok = true, userId = 36705, persona = "Sir Monkey" } = {}) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    const params = Object.fromEntries(new URLSearchParams(init.body));
    // the ORK only reads arguments sent as request[...] fields
    if (params.call === "Authorization/Authorize" && !params["request[UserName]"]) throw new Error("UserName must be sent as request[UserName]");
    calls.push({ url, params });
    let out = {};
    if (params.call === "Authorization/Authorize") out = ok ? { Status: { Status: 0 }, Token: "t".repeat(32), UserId: userId } : { Status: { Status: 5, Error: "bad" } };
    if (params.call === "Player/GetPlayer") out = { Status: { Status: 0 }, Player: { Persona: persona } };
    return new Response(JSON.stringify(out), { status: 200 });
  };
  return { calls, fetchImpl };
}
const req = (body, origin = ORIGIN) => new Request("https://x/api/ork-login", { method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify(body) });

describe("ork-login", () => {
  let store;
  beforeEach(() => { store = memoryStore(); });

  it("mints a verifiable custom token with the Knight claims", async () => {
    const { fetchImpl } = fakeOrk();
    const res = await handleLogin(req({ username: "monkey", password: "pw" }), { env, fetchImpl, store });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.knightSlug).toBe("sir-monkey");
    const [h, p, s] = body.customToken.split(".");
    const ok = crypto.verify("RSA-SHA256", Buffer.from(`${h}.${p}`), publicKey, Buffer.from(s, "base64url"));
    expect(ok).toBe(true);
    const payload = JSON.parse(Buffer.from(p, "base64url").toString());
    expect(payload.uid).toBe("ork_36705");
    expect(payload.claims).toMatchObject({ orkId: 36705, knightSlug: "sir-monkey", admin: false });
  });

  it("never puts the password in a URL and always destroys the session", async () => {
    const { calls, fetchImpl } = fakeOrk();
    await handleLogin(req({ username: "monkey", password: "s3cret!" }), { env, fetchImpl, store });
    expect(calls.every((c) => !String(c.url).includes("s3cret"))).toBe(true);
    expect(calls.at(-1).params.call).toBe("Authorization/DestroySession");
  });

  it("returns an empty knightSlug for a player who isn't on the roster", async () => {
    const { fetchImpl } = fakeOrk({ userId: 1, persona: "Someone Else" });
    const body = await (await handleLogin(req({ username: "x", password: "y" }), { env, fetchImpl, store })).json();
    expect(body.knightSlug).toBe("");
  });

  it("gives the admin claim to ADMIN_ORK_IDS", async () => {
    const { fetchImpl } = fakeOrk({ userId: 999, persona: "Organizer" });
    const body = await (await handleLogin(req({ username: "x", password: "y" }), { env, fetchImpl, store })).json();
    expect(body.admin).toBe(true);
  });

  it("blocks the 6th failed attempt for a username", async () => {
    const { fetchImpl } = fakeOrk({ ok: false });
    for (let i = 0; i < 5; i++) expect((await handleLogin(req({ username: "u", password: "bad" }), { env, fetchImpl, store })).status).toBe(401);
    expect((await handleLogin(req({ username: "u", password: "bad" }), { env, fetchImpl, store })).status).toBe(429);
  });

  it("refuses other origins", async () => {
    const { fetchImpl } = fakeOrk();
    expect((await handleLogin(req({ username: "u", password: "p" }, "https://evil.example"), { env, fetchImpl, store })).status).toBe(403);
    expect(originAllowed(ORIGIN, env)).toBe(true);
  });
});

describe("ork headers", () => {
  it("sends the ORK key and client name as headers, never in the body", async () => {
    const seen = [];
    const fetchImpl = async (url, init) => { seen.push(init); return new Response(JSON.stringify({ Status: { Status: 0 }, Token: "t".repeat(32), UserId: 43232 })); };
    const { orkPost } = await import("../netlify/functions/lib/orkClient.js");
    await orkPost("Player/GetPlayer", { MundaneId: "1" }, { fetchImpl, env: { ORK_API_KEY: "k123" } });
    expect(seen[0].headers["X-Ork-Key"]).toBe("k123");
    expect(seen[0].headers["X-ORK-Client"]).toBe("Court of Blades and Banners/1.0");
    expect(String(seen[0].body)).not.toContain("k123");
  });
});

describe("roster", () => {
  it("has 30 Westmarch Knights plus the 4 Knights of Blackthorne, all unique", () => {
    expect(roster.filter((k) => !k.expansion)).toHaveLength(30);
    expect(roster.filter((k) => k.expansion === "crystal-grove").map((k) => k.slug).sort()).toEqual(["baron-cerberus-grimglaive", "onyx-wolfyre", "piper-lesonette", "ser-jynx-mercades"]);
    expect(new Set(roster.map((k) => k.slug)).size).toBe(roster.length);
    expect(new Set(roster.map((k) => k.orkId)).size).toBe(roster.length);
  });
  it("matches a Blackthorne Knight by ORK number", () => {
    expect(matchKnight({ orkId: 19555, persona: "x" }).slug).toBe("baron-cerberus-grimglaive");
  });
  it("matches by ORK number first, then by persona", () => {
    expect(matchKnight({ orkId: 4098, persona: "anything" }).slug).toBe("downfall");
    expect(matchKnight({ orkId: 0, persona: "  sir   ZYAX blackraven " }).slug).toBe("sir-zyax-blackraven");
    expect(matchKnight({ orkId: 43232, persona: "Augustus Rodriguez" }).slug).toBe("sir-kismet");
  });
});

describe("ork request format", () => {
  it("wraps every argument in request[...] like ORK's JsonServer expects", async () => {
    const { orkBody } = await import("../netlify/functions/lib/orkClient.js");
    const b = orkBody("Authorization/Authorize", { UserName: "monkey", Password: "pw", Client: "C" });
    expect(b.get("call")).toBe("Authorization/Authorize");
    expect(b.get("request[UserName]")).toBe("monkey");
    expect(b.get("request[Password]")).toBe("pw");
    expect(b.has("UserName")).toBe(false);
  });
  it("tolerates ORK warnings printed before the JSON", async () => {
    const { orkPost } = await import("../netlify/functions/lib/orkClient.js");
    const fetchImpl = async () => new Response('Parameter x is not set; {"Status":{"Status":0},"Token":"t","UserId":1}');
    const r = await orkPost("Player/GetPlayer", {}, { fetchImpl, env: {} });
    expect(r.UserId).toBe(1);
  });
  it("reports a firewall challenge as blocked", async () => {
    const { orkPost } = await import("../netlify/functions/lib/orkClient.js");
    const fetchImpl = async () => new Response("<html><title>Just a moment...</title></html>", { status: 403 });
    await expect(orkPost("Player/GetPlayer", {}, { fetchImpl, env: {} })).rejects.toMatchObject({ kind: "blocked" });
  });
});
