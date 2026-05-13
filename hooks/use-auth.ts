"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile, createUserProfile } from "@/lib/firestore";
import { useAuthStore } from "@/store/auth-store";

export function useAuth() {
  const { user, loading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        return;
      }
      try {
        let profile = await getUserProfile(firebaseUser.uid);
        if (!profile) {
          await createUserProfile(
            firebaseUser.uid,
            firebaseUser.email ?? "",
            firebaseUser.displayName ?? "User",
            firebaseUser.photoURL ?? undefined
          );
          profile = await getUserProfile(firebaseUser.uid);
        }
        setUser(profile);
      } catch {
        setUser(null);
      }
    });
    return unsub;
  }, [setUser]);

  return { user, loading };
}
