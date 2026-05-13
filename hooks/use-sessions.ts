"use client";

import { useEffect, useState } from "react";
import { getUserSessions } from "@/lib/firestore";
import { useSessionStore } from "@/store/session-store";
import { useAuthStore } from "@/store/auth-store";

export function useSessions() {
  const { user } = useAuthStore();
  const { sessions, setSessions } = useSessionStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSessions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getUserSessions(user.uid)
      .then(setSessions)
      .catch(() => setError("Failed to load sessions"))
      .finally(() => setLoading(false));
  }, [user, setSessions]);

  return { sessions, loading, error };
}
