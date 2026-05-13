import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { UserProfile, Session, SessionType, AnalyticsSummary, CohortRow, FunnelStep, AbTestMetrics, DauDataPoint } from "@/types";
import { getWeekLabel } from "./utils";

// ─── User helpers ─────────────────────────────────────────────────────────────

export async function createUserProfile(
  uid: string,
  email: string,
  displayName: string,
  photoURL?: string
): Promise<void> {
  const signupDate = new Date();
  const profile = {
    email,
    displayName,
    photoURL: photoURL ?? "",
    isAdmin: false,
    onboardingComplete: false,
    dailyGoal: 10,
    interests: [] as string[],
    createdAt: Timestamp.fromDate(signupDate),
    cohortWeek: getWeekLabel(signupDate),
    abTestGroup: (Math.random() < 0.5 ? "A" : "B") as "A" | "B",
    sessionCount: 0,
    streakDays: 0,
  };
  await setDoc(doc(db, "users", uid), profile, { merge: true });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid: snap.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    lastActiveDate: data.lastActiveDate?.toDate?.(),
  } as UserProfile;
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<Omit<UserProfile, "uid">>
): Promise<void> {
  await updateDoc(doc(db, "users", uid), updates as Record<string, unknown>);
}

export async function completeOnboarding(
  uid: string,
  interests: string[],
  dailyGoal: number,
  onboardingDuration: number
): Promise<void> {
  await updateDoc(doc(db, "users", uid), {
    onboardingComplete: true,
    interests,
    dailyGoal,
    onboardingDuration,
  });
}

// ─── Session helpers ───────────────────────────────────────────────────────────

export async function saveSession(
  userId: string,
  sessionType: SessionType,
  duration: number,
  onboardingDuration?: number
): Promise<string> {
  const ref = await addDoc(collection(db, "sessions"), {
    userId,
    sessionType,
    duration,
    completedAt: serverTimestamp(),
    ...(onboardingDuration !== undefined ? { onboardingDuration } : {}),
  });

  // Update user stats
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const data = userSnap.data();
    await updateDoc(userRef, {
      sessionCount: (data.sessionCount ?? 0) + 1,
      lastActiveDate: serverTimestamp(),
    });
  }

  return ref.id;
}

export async function getUserSessions(
  userId: string,
  limitCount = 50
): Promise<Session[]> {
  const q = query(
    collection(db, "sessions"),
    where("userId", "==", userId),
    orderBy("completedAt", "desc"),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      userId: data.userId,
      sessionType: data.sessionType as SessionType,
      duration: data.duration,
      completedAt: data.completedAt?.toDate?.() ?? new Date(),
      onboardingDuration: data.onboardingDuration,
    };
  });
}

// ─── Analytics helpers ─────────────────────────────────────────────────────────

export async function getAnalyticsSummary(): Promise<AnalyticsSummary | null> {
  const snap = await getDoc(doc(db, "analytics", "summary"));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    totalUsers: d.totalUsers ?? 0,
    totalSessions: d.totalSessions ?? 0,
    avgSessionDuration: d.avgSessionDuration ?? 0,
    retention90Day: d.retention90Day ?? 0,
    updatedAt: d.updatedAt?.toDate?.() ?? new Date(),
  };
}

export async function getDauData(): Promise<DauDataPoint[]> {
  const snap = await getDoc(doc(db, "analytics", "dau"));
  if (!snap.exists()) return [];
  const d = snap.data();
  return (d.points ?? []) as DauDataPoint[];
}

export async function getCohortRetention(): Promise<CohortRow[]> {
  const snap = await getDoc(doc(db, "analytics", "cohortRetention"));
  if (!snap.exists()) return [];
  const d = snap.data();
  return (d.rows ?? []) as CohortRow[];
}

export async function getFunnelData(): Promise<FunnelStep[]> {
  const snap = await getDoc(doc(db, "analytics", "funnel"));
  if (!snap.exists()) return [];
  const d = snap.data();
  return (d.steps ?? []) as FunnelStep[];
}

export async function getAbTestMetrics(): Promise<AbTestMetrics[]> {
  const snap = await getDoc(doc(db, "analytics", "abTest"));
  if (!snap.exists()) return [];
  const d = snap.data();
  return (d.groups ?? []) as AbTestMetrics[];
}
