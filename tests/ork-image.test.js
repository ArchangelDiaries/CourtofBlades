import { describe, it, expect } from "vitest";
import { handleImage } from "../netlify/functions/ork-image.js";
import roster from "../shared/knights.js";

const PNG = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13]);
const rose = roster.find((k) => k.slug === "sir-rose-thorn").orkId;
const get = (q) => new Request(`https://x/api/ork-image?${q}`);

function fakeOrk(files, { heraldryUrl } = {}) {
  const seen = [];
  const fetchImpl = async (url, init = {}) => {
    seen.push({ url: String(url), headers: init.headers });
    if (String(url).includes("/orkservice/")) {
      const p = Object.fromEntries(new URLSearchParams(init.body));
      if (p.call === "Heraldry/GetHeraldryUrl" && p["request[Type]"] === "Player") return new Response(JSON.stringify({ Url: heraldryUrl || "" }), { status: 200 });
      return new Response("{}", { status: 200 });
    }
    const path = new URL(url).pathname;
    if (files[path]) return new Response(files[path].body, { status: 200, headers: { "content-type": files[path].type } });
    return new Response("missing", { status: 404, headers: { "content-type": "text/html" } });
  };
  return { fetchImpl, seen };
}
const env = { ORK_API_KEY: "test-key" };

describe("ork-image", () => {
  it("refuses ORK numbers that aren't on the Knights roster", async () => {
    const { fetchImpl, seen } = fakeOrk({});
    const r = await handleImage(get("id=1&kind=portrait"), { env, fetchImpl });
    expect(r.status).toBe(404);
    expect(seen.length).toBe(0);
  });

  it("serves the portrait when the ORK has one, with the key header and CDN caching", async () => {
    const pad = String(rose).padStart(6, "0");
    const { fetchImpl, seen } = fakeOrk({ [`/assets/players/${pad}.jpg`]: { body: PNG, type: "image/jpeg" } });
    const r = await handleImage(get(`id=${rose}&kind=portrait`), { env, fetchImpl });
    expect(r.status).toBe(200);
    expect(r.headers.get("content-type")).toBe("image/jpeg");
    expect(r.headers.get("netlify-cdn-cache-control")).toMatch(/max-age=604800/);
    expect(seen.find((s) => s.url.includes("/assets/players/")).headers["X-Ork-Key"]).toBe("test-key");
  });

  it("falls back from portrait to heraldry, using the URL the ORK reports", async () => {
    const pad = String(rose).padStart(6, "0");
    const { fetchImpl } = fakeOrk({ [`/assets/heraldry/player/${pad}.png`]: { body: PNG, type: "image/png" } }, { heraldryUrl: `https://ork.amtgard.com/assets/heraldry/player/${pad}.png?v=123` });
    const r = await handleImage(get(`id=${rose}&kind=portrait`), { env, fetchImpl });
    expect(r.status).toBe(200);
    expect(r.headers.get("content-type")).toBe("image/png");
  });

  it("ignores non-image responses and off-site URLs, then 404s", async () => {
    const { fetchImpl, seen } = fakeOrk({}, { heraldryUrl: "https://evil.example/x.png" });
    const r = await handleImage(get(`id=${rose}&kind=heraldry`), { env, fetchImpl });
    expect(r.status).toBe(404);
    expect(seen.some((s) => s.url.includes("evil.example"))).toBe(false);
  });
});
