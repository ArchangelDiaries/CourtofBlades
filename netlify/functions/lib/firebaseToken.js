// Mints a Firebase custom token (RS256) without the Admin SDK.
// https://firebase.google.com/docs/auth/admin/create-custom-tokens#create_custom_tokens_using_a_third-party_jwt_library
import crypto from "node:crypto";

const AUD = "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit";
const b64url = (buf) => Buffer.from(buf).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");

export function normalizeKey(key = "") {
  return key.includes("\\n") ? key.replace(/\\n/g, "\n") : key;
}

export function mintCustomToken({ clientEmail, privateKey, uid, claims = {}, now = Math.floor(Date.now() / 1000) }) {
  if (!clientEmail || !privateKey) throw new Error("Firebase service account is not configured");
  if (!uid || uid.length > 128) throw new Error("Invalid uid");
  const header = { alg: "RS256", typ: "JWT" };
  const payload = { iss: clientEmail, sub: clientEmail, aud: AUD, iat: now, exp: now + 3600, uid, claims };
  const unsigned = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsigned);
  return `${unsigned}.${b64url(signer.sign(normalizeKey(privateKey)))}`;
}
