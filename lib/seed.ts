/**
 * Seed script — generates synthetic users + sessions in Firestore.
 *
 * Usage:
 *   npm run seed           # full: 50,000 users ~2.85M sessions (requires Blaze plan)
 *   npm run seed -- --small  # demo: 200 users ~11,000 sessions (fits free Spark tier)
 *
 * Free Spark tier limit: 20,000 writes/day.
 * Full seed requires the Blaze (pay-as-you-go) plan.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  writeBatch,
  doc,
  collection,
  setDoc,
  Timestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

const SESSION_TYPES = ["breathing", "meditation", "focus"] as const;
const DURATIONS = [5, 10, 15, 20] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function getWeekLabel(date: Date): string {
  const year = date.getFullYear();
  const start = new Date(date.getFullYear(), 0, 1);
  const week = Math.ceil(((date.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

function randomDate(start: Date, end: Date, seed: number): Date {
  const r = seededRandom(seed);
  return new Date(start.getTime() + r * (end.getTime() - start.getTime()));
}

function generateOnboardingDuration(seed: number): number {
  const r = seededRandom(seed);
  if (r < 0.3) return Math.floor(seededRandom(seed * 7) * 3);      // 0–2 min (fast)
  if (r < 0.7) return Math.floor(3 + seededRandom(seed * 11) * 4); // 3–6 min (average)
  return Math.floor(7 + seededRandom(seed * 13) * 20);              // 7–27 min (slow)
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function flushBatch(
  ops: Array<{ ref: ReturnType<typeof doc>; data: Record<string, unknown> }>,
  retries = 3
): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const batch = writeBatch(db);
      ops.forEach(({ ref, data }) => batch.set(ref, data));
      await batch.commit();
      return;
    } catch (err: unknown) {
      const isQuota =
        err instanceof Error && err.message.includes("RESOURCE_EXHAUSTED");
      if (isQuota && attempt < retries) {
        const wait = attempt * 5000;
        console.log(`  ⚠ Quota hit — waiting ${wait / 1000}s before retry ${attempt}/${retries - 1}…`);
        await sleep(wait);
      } else {
        throw err;
      }
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  const isSmall = process.argv.includes("--small");

  const TOTAL_USERS = isSmall ? 200 : 50_000;
  const SESSIONS_PER_USER_BASE = isSmall ? 55 : 57;
  // Delay between batches (ms) — increase if hitting quota on free tier
  const BATCH_DELAY = isSmall ? 200 : 100;

  const signupStart = new Date("2024-01-01");
  const signupEnd = new Date("2024-12-31");
  const now = new Date();

  console.log(
    `\n🌱 Seeding ${TOTAL_USERS.toLocaleString()} users (${isSmall ? "demo/free-tier" : "full"} mode)…`
  );
  if (!isSmall) {
    console.log(
      `   ⚠ Full mode requires the Firebase Blaze plan (>20K writes/day).\n` +
      `   Use --small for the free Spark tier: npm run seed -- --small\n`
    );
  }

  let userBatchOps: Array<{ ref: ReturnType<typeof doc>; data: Record<string, unknown> }> = [];
  let sessionBatchOps: Array<{ ref: ReturnType<typeof doc>; data: Record<string, unknown> }> = [];
  let totalSessionsWritten = 0;
  let batchCount = 0;

  for (let i = 0; i < TOTAL_USERS; i++) {
    const userId = `seed_user_${i.toString().padStart(6, "0")}`;
    const signupDate = randomDate(signupStart, signupEnd, i * 31);
    const onboardingDuration = generateOnboardingDuration(i * 17);
    const abTestGroup: "A" | "B" = seededRandom(i * 23) < 0.5 ? "A" : "B";
    const cohortWeek = getWeekLabel(signupDate);

    const userSessionCount = Math.max(
      1,
      Math.floor(seededRandom(i * 41) * SESSIONS_PER_USER_BASE * 1.5 + 5)
    );
    const lastActiveDate = randomDate(signupDate, now, i * 53);

    userBatchOps.push({
      ref: doc(db, "users", userId),
      data: {
        userId,
        email: `user${i}@example.com`,
        displayName: `User ${i}`,
        isAdmin: false,
        onboardingComplete: true,
        onboardingDuration,
        dailyGoal: 10,
        interests: [] as string[],
        createdAt: Timestamp.fromDate(signupDate),
        cohortWeek,
        abTestGroup,
        sessionCount: userSessionCount,
        lastActiveDate: Timestamp.fromDate(lastActiveDate),
        streakDays: Math.floor(seededRandom(i * 59) * 30),
      },
    });

    for (let j = 0; j < userSessionCount; j++) {
      const sessionDate = randomDate(signupDate, now, i * 67 + j);
      const sessionType = SESSION_TYPES[Math.floor(seededRandom(i * 71 + j) * 3)];
      const duration = DURATIONS[Math.floor(seededRandom(i * 79 + j) * 4)];

      const sessionData: Record<string, unknown> = {
        userId,
        sessionType,
        duration,
        completedAt: Timestamp.fromDate(sessionDate),
      };
      if (j === 0) sessionData.onboardingDuration = onboardingDuration;

      sessionBatchOps.push({ ref: doc(collection(db, "sessions")), data: sessionData });
      totalSessionsWritten++;

      if (sessionBatchOps.length >= 500) {
        await flushBatch(sessionBatchOps);
        sessionBatchOps = [];
        batchCount++;
        if (BATCH_DELAY > 0) await sleep(BATCH_DELAY);
      }
    }

    if (userBatchOps.length >= 500) {
      await flushBatch(userBatchOps);
      userBatchOps = [];
      batchCount++;
      if (BATCH_DELAY > 0) await sleep(BATCH_DELAY);
    }

    const logInterval = isSmall ? 50 : 5000;
    if ((i + 1) % logInterval === 0 || i + 1 === TOTAL_USERS) {
      console.log(
        `  ✓ ${(i + 1).toLocaleString()} users / ${totalSessionsWritten.toLocaleString()} sessions (${batchCount} batches)`
      );
    }
  }

  if (userBatchOps.length > 0) { await flushBatch(userBatchOps); batchCount++; }
  if (sessionBatchOps.length > 0) { await flushBatch(sessionBatchOps); batchCount++; }

  // ─── Analytics aggregates ─────────────────────────────────────────────────
  console.log(`\n📊 Writing analytics aggregates…`);

  await setDoc(doc(db, "analytics", "summary"), {
    totalUsers: TOTAL_USERS,
    totalSessions: totalSessionsWritten,
    avgSessionDuration: 12.4,
    retention90Day: 31.2,
    updatedAt: Timestamp.fromDate(now),
  });

  const dauPoints = Array.from({ length: 30 }, (_, idx) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (29 - idx));
    const scale = TOTAL_USERS / 50_000;
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      dau: Math.floor((1200 + Math.sin(idx / 3) * 300 + seededRandom(idx * 97) * 200) * scale),
    };
  });
  await setDoc(doc(db, "analytics", "dau"), { points: dauPoints });

  const funnelScale = TOTAL_USERS / 50_000;
  await setDoc(doc(db, "analytics", "funnel"), {
    steps: [
      { name: "Signed up",             value: Math.round(50000 * funnelScale), dropoffPct: 0  },
      { name: "Started onboarding",    value: Math.round(43500 * funnelScale), dropoffPct: 13 },
      { name: "Completed onboarding",  value: Math.round(31200 * funnelScale), dropoffPct: 28 },
      { name: "First session",         value: Math.round(22800 * funnelScale), dropoffPct: 27 },
      { name: "Day 7 active",          value: Math.round(14400 * funnelScale), dropoffPct: 37 },
    ],
  });

  await setDoc(doc(db, "analytics", "abTest"), {
    groups: [
      { group: "A", retentionRate: 0.31, avgSessionsPerWeek: 2.4, completionRate: 0.68, userCount: Math.round(TOTAL_USERS / 2) },
      { group: "B", retentionRate: 0.38, avgSessionsPerWeek: 2.9, completionRate: 0.74, userCount: Math.round(TOTAL_USERS / 2) },
    ],
  });

  console.log(
    `\n✅ Seed complete!\n` +
    `   ${TOTAL_USERS.toLocaleString()} users\n` +
    `   ${totalSessionsWritten.toLocaleString()} sessions\n` +
    `   ${batchCount} Firestore batches committed\n`
  );
}

seed().catch((err) => {
  console.error("\n❌ Seed failed:", err.message ?? err);
  process.exit(1);
});
