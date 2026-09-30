// Firestore rules tests. Run with: npm run test:rules (needs Java; starts the emulator).
// Skipped automatically when no emulator is running, so `npm test` stays fast.
import { describe, it, beforeAll, afterAll, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

const HAS_EMU = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
let env;

const entry = (uid, extra = {}) => ({
  slug: "sir-monkey", knight: "Sir Monkey", orkId: 36705, uid,
  known: "", style: "Commander", effect: "Lead and inspire", freq: "Once per game",
  aname: "The Monkey's Paw", desc: "Everyone near me gets back up once.", quote: "", art: "",
  ok: true, status: "submitted", updatedAt: serverTimestamp(), ...extra,
});

describe.skipIf(!HAS_EMU)("firestore rules", () => {
  beforeAll(async () => {
    env = await initializeTestEnvironment({ projectId: "demo-cob", firestore: { rules: readFileSync("firestore.rules", "utf8") } });
  });
  afterAll(async () => env && env.cleanup());
  beforeEach(async () => env.clearFirestore());

  const monkey = () => env.authenticatedContext("ork_36705", { knightSlug: "sir-monkey", orkId: 36705 }).firestore();
  const other = () => env.authenticatedContext("ork_1", { knightSlug: "", orkId: 1 }).firestore();
  const admin = () => env.authenticatedContext("ork_999", { admin: true }).firestore();

  it("a Knight writes and reads their own entry", async () => {
    await assertSucceeds(setDoc(doc(monkey(), "responses/sir-monkey"), entry("ork_36705")));
    await assertSucceeds(getDoc(doc(monkey(), "responses/sir-monkey")));
  });

  it("nobody else can read or write it", async () => {
    await assertFails(setDoc(doc(other(), "responses/sir-monkey"), entry("ork_1")));
    await env.withSecurityRulesDisabled(async (c) => setDoc(doc(c.firestore(), "responses/sir-monkey"), { slug: "sir-monkey" }));
    await assertFails(getDoc(doc(other(), "responses/sir-monkey")));
  });

  it("a submitted entry needs permission, a name and a description", async () => {
    await assertFails(setDoc(doc(monkey(), "responses/sir-monkey"), entry("ork_36705", { ok: false })));
    await assertFails(setDoc(doc(monkey(), "responses/sir-monkey"), entry("ork_36705", { aname: "" })));
    await assertSucceeds(setDoc(doc(monkey(), "responses/sir-monkey"), entry("ork_36705", { ok: false, aname: "", status: "draft" })));
  });

  it("a Knight can't set review fields; the admin can", async () => {
    await assertFails(setDoc(doc(monkey(), "responses/sir-monkey"), entry("ork_36705", { reviewStatus: "inbook" })));
    await assertSucceeds(setDoc(doc(monkey(), "responses/sir-monkey"), entry("ork_36705")));
    await assertSucceeds(updateDoc(doc(admin(), "responses/sir-monkey"), { reviewStatus: "balanced", adminNotes: "Make it once per game" }));
    await assertSucceeds(setDoc(doc(monkey(), "responses/sir-monkey"), entry("ork_36705", { aname: "Renamed" }), { merge: true }));
  });

  it("progress is public to read, owner-only to write", async () => {
    await assertSucceeds(setDoc(doc(monkey(), "progress/sir-monkey"), { submitted: true, at: serverTimestamp() }));
    await assertSucceeds(getDoc(doc(env.unauthenticatedContext().firestore(), "progress/sir-monkey")));
    await assertFails(setDoc(doc(other(), "progress/sir-monkey"), { submitted: true, at: serverTimestamp() }));
  });

  it("an admin link lets an unmatched account write that Knight's entry", async () => {
    await assertFails(setDoc(doc(other(), "links/ork_1"), { slug: "sir-monkey" }));
    await assertSucceeds(setDoc(doc(admin(), "links/ork_1"), { slug: "sir-monkey", orkId: 1, persona: "Monkey" }));
    await assertSucceeds(setDoc(doc(other(), "responses/sir-monkey"), entry("ork_1")));
  });
});
