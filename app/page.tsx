"use client";

import Link from "next/link";
import { BarChart3, Brain, Play, History, Flame, TrendingUp, GitBranch, FlaskConical, ArrowRight, Check } from "lucide-react";

const techStack = [
  "Next.js 14", "TypeScript", "Tailwind CSS v4", "Firebase v10",
  "Recharts", "Zustand", "shadcn/ui",
];

const analyticsFeatures = [
  { icon: BarChart3, label: "Overview & DAU metrics" },
  { icon: TrendingUp, label: "Cohort retention analysis" },
  { icon: GitBranch, label: "Onboarding funnel" },
  { icon: FlaskConical, label: "A/B test results + z-test" },
];

const appFeatures = [
  { icon: Brain, label: "Guided meditation & breathing" },
  { icon: Play, label: "Timed session with countdown" },
  { icon: History, label: "Session history & charts" },
  { icon: Flame, label: "Streak tracking" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0F1117] text-white">
      {/* Nav */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7F77DD]/20">
            <Brain className="h-4 w-4 text-[#7F77DD]" />
          </div>
          <span className="font-semibold">MindfulMinutes</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-white/50 hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/analytics/overview"
            className="flex items-center gap-1.5 rounded-lg bg-[#7F77DD] px-4 py-2 text-sm font-medium hover:bg-[#6e66cc] transition-colors"
          >
            Analytics Demo <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16 space-y-24">
        {/* Hero */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#7F77DD]/30 bg-[#7F77DD]/10 px-4 py-1.5 text-xs text-[#7F77DD] font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7F77DD] animate-pulse" />
            Full-stack portfolio project
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold leading-tight">
            Wellness app +{" "}
            <span className="text-[#7F77DD]">analytics</span>{" "}
            dashboard
          </h1>
          <p className="text-lg text-white/50 max-w-xl mx-auto leading-relaxed">
            A production-quality mindfulness app with a full product analytics suite —
            cohort retention, onboarding funnel, A/B testing, and live DAU charts.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/analytics/overview"
              className="flex items-center gap-2 rounded-xl bg-[#7F77DD] px-6 py-3.5 font-semibold hover:bg-[#6e66cc] transition-colors w-full sm:w-auto justify-center"
            >
              <BarChart3 className="h-5 w-5" />
              View Analytics Dashboard
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 font-semibold hover:bg-white/10 transition-colors w-full sm:w-auto justify-center"
            >
              <Play className="h-5 w-5" />
              Try the User App
            </Link>
          </div>
        </section>

        {/* Tech stack pills */}
        <section className="text-center space-y-4">
          <p className="text-xs uppercase tracking-widest text-white/30 font-medium">Built with</p>
          <div className="flex flex-wrap justify-center gap-2">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* Two feature cards */}
        <section className="grid md:grid-cols-2 gap-6">
          {/* Analytics card */}
          <div className="rounded-2xl border border-[#7F77DD]/30 bg-[#7F77DD]/5 p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7F77DD]/20">
                <BarChart3 className="h-5 w-5 text-[#7F77DD]" />
              </div>
              <div>
                <h2 className="font-semibold">Analytics Dashboard</h2>
                <p className="text-xs text-white/40">No login required</p>
              </div>
            </div>
            <ul className="space-y-3">
              {analyticsFeatures.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-sm text-white/70">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#7F77DD]/15">
                    <Icon className="h-3.5 w-3.5 text-[#7F77DD]" />
                  </div>
                  {label}
                </li>
              ))}
            </ul>
            <Link
              href="/analytics/overview"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#7F77DD] px-4 py-3 text-sm font-semibold hover:bg-[#6e66cc] transition-colors"
            >
              Open dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* User app card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <Brain className="h-5 w-5 text-white/80" />
              </div>
              <div>
                <h2 className="font-semibold">Wellness App</h2>
                <p className="text-xs text-white/40">Free account required</p>
              </div>
            </div>
            <ul className="space-y-3">
              {appFeatures.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-sm text-white/70">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/10">
                    <Icon className="h-3.5 w-3.5 text-white/60" />
                  </div>
                  {label}
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <Link
                href="/signup"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/15 transition-colors"
              >
                Sign up free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="flex items-center justify-center rounded-xl border border-white/10 px-4 py-3 text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>

        {/* Key metrics strip */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <p className="text-xs uppercase tracking-widest text-white/30 font-medium text-center mb-8">
            What the analytics dashboard tracks
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "50K", label: "Synthetic users" },
              { value: "2.85M", label: "Session events" },
              { value: "12wk", label: "Cohort retention" },
              { value: "p<0.05", label: "A/B significance" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-bold text-[#7F77DD]">{value}</p>
                <p className="text-xs text-white/40 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <section className="text-center space-y-4 pb-8">
          <p className="text-white/40 text-sm">
            Built by{" "}
            <a
              href="https://github.com/BAVISETTISAKETH"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#7F77DD] hover:underline"
            >
              Saketh Bavisetti
            </a>
          </p>
          <Link
            href="/analytics/overview"
            className="inline-flex items-center gap-2 rounded-xl bg-[#7F77DD] px-8 py-4 font-semibold hover:bg-[#6e66cc] transition-colors text-lg"
          >
            <BarChart3 className="h-5 w-5" />
            View live analytics demo
          </Link>
        </section>
      </main>
    </div>
  );
}
