import { createContext, useContext, useEffect, useState } from "react";
import { onIdTokenChanged, signInWithCustomToken, signOut, GoogleAuthProvider, signInWithPopup, updateProfile } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase.js";
import ROSTER from "../../shared/knights.js";

const Ctx = createContext(null);
export const useSession = () => useContext(Ctx);
export const knightBySlug = (slug) => ROSTER.find((k) => k.slug === slug) || null;

export function SessionProvider({ children }) {
  const [state, setState] = useState({ ready: !auth, user: null, claims: {}, linkedSlug: "" });

  useEffect(() => {
    if (!auth) return;
    let unLink = () => {};
    const un = onIdTokenChanged(auth, async (user) => {
      unLink();
      if (!user) { setState({ ready: true, user: null, claims: {}, linkedSlug: "" }); return; }
      const { claims } = await user.getIdTokenResult();
      setState((s) => ({ ...s, ready: true, user, claims }));
      unLink = onSnapshot(doc(db, "links", user.uid), (snap) => {
        setState((s) => ({ ...s, linkedSlug: snap.exists() ? snap.data().slug || "" : "" }));
      }, () => {});
    });
    return () => { un(); unLink(); };
  }, []);

  const email = state.user?.email || "";
  const isAdmin = state.claims.admin === true || (email === "antifreke@gmail.com" && state.user?.emailVerified);
  const slug = state.claims.knightSlug || state.linkedSlug || "";
  const value = {
    ...state,
    isAdmin,
    slug,
    knight: knightBySlug(slug),
    persona: state.claims.persona || state.user?.displayName || "",
    async signInWithOrk(username, password) {
      const res = await fetch("/api/ork-login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Sign-in failed. Try again.");
      const cred = await signInWithCustomToken(auth, data.customToken);
      if (data.persona) await updateProfile(cred.user, { displayName: data.persona }).catch(() => {});
      return data;
    },
    async signInWithGoogle() { await signInWithPopup(auth, new GoogleAuthProvider()); },
    async signOut() { await signOut(auth); },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
