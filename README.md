# MindfulMinutes

A full-stack mindfulness web app with a user-facing wellness experience and an admin analytics dashboard.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (Radix UI primitives) |
| Charts | Recharts |
| Backend | Firebase v10 (Auth + Firestore) |
| State | Zustand v5 |

## Project structure

```
app/
  (auth)/login, signup          ← public auth pages
  (app)/dashboard               ← home after login
  (app)/session                 ← start a timed session
  (app)/history                 ← past sessions + bar chart
  (app)/profile                 ← user settings
  (app)/onboarding              ← 3-step first-time flow (tracked)
  (analytics)/overview          ← key metrics + DAU chart
  (analytics)/retention         ← cohort table + retention curves
  (analytics)/funnel            ← onboarding funnel
  (analytics)/ab-test           ← A/B test results + z-test
components/
  ui/                           ← shadcn/ui primitives
  app/                          ← user-app components
  analytics/                    ← dashboard components
lib/
  firebase.ts                   ← Firebase initialisation
  firestore.ts                  ← DB read/write helpers
  seed.ts                       ← synthetic data generator
  utils.ts                      ← shared helpers
store/
  auth-store.ts                 ← Zustand auth state
  session-store.ts              ← session UI state
hooks/
  use-auth.ts, use-sessions.ts, use-mobile.ts
types/index.ts                  ← all TypeScript types
```

## Setup

### 1. Clone and install

```bash
git clone <repo>
cd mindfulminutes
npm install
```

### 2. Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/) → Create project
2. Enable **Authentication** → Email/Password + Google
3. Enable **Firestore Database** → Start in test mode
4. In Project Settings → Your apps → Add web app → copy the config
5. Add your domain to **Authentication → Authorised domains**

### 3. Environment variables

```bash
cp .env.local.example .env.local
```

Fill in the values from your Firebase project config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

### 4. Admin user

To access the analytics dashboard (`/analytics/overview`), manually set `isAdmin: true` on a Firestore user document:

1. Sign up normally
2. Open Firestore → `users` collection → find your document
3. Edit → add field `isAdmin: true (boolean)`

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → redirects to `/login`.

## Seed script (analytics data)

Generates **50,000 synthetic users** and **~2.85M sessions** in Firestore.
Also writes pre-computed analytics aggregates (DAU, funnel, A/B test, cohort retention).

```bash
npm run seed
```

> ⚠️ This writes to your live Firestore database. Use a dedicated dev project.
> Writes ~57 sessions per user in batches of 500. Expect ~10–20 minutes for full run.

### Onboarding duration distribution

| Bucket | Share | Behaviour |
|--------|-------|-----------|
| < 3 min | 30% | Fast onboarders — 2× retention |
| 3–7 min | 40% | Average onboarders |
| > 7 min | 30% | Slow onboarders — lower retention |

## Features

### User app
- Email/password + Google OAuth
- 3-step onboarding (tracks time from signup → first session)
- Dashboard with streak, stats, weekly radial bar chart
- Session timer with breathing animation and countdown ring
- Session history with type filter + weekly bar chart
- Profile editor with daily goal

### Analytics dashboard
- **Overview** — total users, sessions, avg duration, 90-day retention; DAU line chart; session type donut
- **Retention** — cohort table (week 0–12) with heat-map colouring; two-line retention curve comparing fast vs slow onboarders
- **Funnel** — horizontal bar chart with drop-off % at each onboarding step
- **A/B Test** — side-by-side group comparison; client-side z-test with significance badge

## Scripts

```bash
npm run dev      # start dev server
npm run build    # production build
npm run lint     # ESLint
npm run format   # Prettier
npm run seed     # generate synthetic Firestore data
```

## Design tokens

| Token | Value |
|-------|-------|
| Primary (purple) | `#7F77DD` |
| Analytics bg | `#0F1117` |
| Analytics card | `#1C1F26` |
| User app bg | `#FFFFFF` |
