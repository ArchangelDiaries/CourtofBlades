import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase.js";

// Public board of which Knights have submitted (no answers, just a flag).
export function useProgress() {
  const [done, setDone] = useState({});
  useEffect(() => {
    if (!db) return;
    return onSnapshot(collection(db, "progress"), (snap) => {
      const m = {};
      snap.forEach((d) => { if (d.data().submitted) m[d.id] = true; });
      setDone(m);
    }, () => {});
  }, []);
  return done;
}
