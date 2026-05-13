"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { getAbTestMetrics } from "@/lib/firestore";
import type { AbTestMetrics } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Simple z-test for two proportions
function zTest(p1: number, n1: number, p2: number, n2: number): { z: number; significant: boolean } {
  const p = (p1 * n1 + p2 * n2) / (n1 + n2);
  const se = Math.sqrt(p * (1 - p) * (1 / n1 + 1 / n2));
  if (se === 0) return { z: 0, significant: false };
  const z = Math.abs((p1 - p2) / se);
  return { z, significant: z > 1.96 }; // p < 0.05
}

function generateAbData(): AbTestMetrics[] {
  return [
    { group: "A", retentionRate: 0.31, avgSessionsPerWeek: 2.4, completionRate: 0.68, userCount: 25000 },
    { group: "B", retentionRate: 0.38, avgSessionsPerWeek: 2.9, completionRate: 0.74, userCount: 25000 },
  ];
}

interface MetricRow {
  metric: string;
  A: number;
  B: number;
}

export default function AbTestPage() {
  const [groups, setGroups] = useState<AbTestMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAbTestMetrics()
      .then((d) => setGroups(d.length ? d : generateAbData()))
      .finally(() => setLoading(false));
  }, []);

  const [a, b] = groups.length === 2 ? groups : [null, null];

  const retentionSig = a && b
    ? zTest(a.retentionRate, a.userCount, b.retentionRate, b.userCount)
    : null;
  const completionSig = a && b
    ? zTest(a.completionRate, a.userCount, b.completionRate, b.userCount)
    : null;

  const chartData: MetricRow[] = [
    { metric: "Retention", A: Math.round((a?.retentionRate ?? 0) * 100), B: Math.round((b?.retentionRate ?? 0) * 100) },
    { metric: "Completion", A: Math.round((a?.completionRate ?? 0) * 100), B: Math.round((b?.completionRate ?? 0) * 100) },
    { metric: "Sessions/wk", A: Math.round((a?.avgSessionsPerWeek ?? 0) * 10), B: Math.round((b?.avgSessionsPerWeek ?? 0) * 10) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">A/B Test Results</h1>
        <p className="text-white/40 mt-1 text-sm">Group A vs Group B — onboarding variant</p>
      </div>

      {/* Group metric cards */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-48 rounded-xl bg-white/10" />
          <Skeleton className="h-48 rounded-xl bg-white/10" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {groups.map((g) => (
            <div key={g.group} className={cn(
              "rounded-xl border p-5 space-y-4",
              g.group === "B" ? "border-[#7F77DD]/40 bg-[#7F77DD]/5" : "border-white/10 bg-[#1C1F26]"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("h-7 w-7 rounded-full flex items-center justify-center text-sm font-bold",
                    g.group === "B" ? "bg-[#7F77DD] text-white" : "bg-white/10 text-white")}>
                    {g.group}
                  </div>
                  <span className="font-semibold">Group {g.group}</span>
                  {g.group === "B" && (
                    <span className="rounded-full bg-green-500/20 text-green-400 text-xs px-2 py-0.5">Winner</span>
                  )}
                </div>
                <span className="text-xs text-white/40">{g.userCount.toLocaleString()} users</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-xl font-bold">{(g.retentionRate * 100).toFixed(1)}%</p>
                  <p className="text-xs text-white/40 mt-0.5">Retention</p>
                </div>
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-xl font-bold">{g.avgSessionsPerWeek.toFixed(1)}</p>
                  <p className="text-xs text-white/40 mt-0.5">Sess/week</p>
                </div>
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-xl font-bold">{(g.completionRate * 100).toFixed(1)}%</p>
                  <p className="text-xs text-white/40 mt-0.5">Completion</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statistical significance */}
      {!loading && retentionSig && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className={cn(
            "rounded-xl border p-4 flex items-center gap-3",
            retentionSig.significant ? "border-green-500/30 bg-green-500/10" : "border-white/10 bg-[#1C1F26]"
          )}>
            <span className={cn("text-lg", retentionSig.significant ? "text-green-400" : "text-white/40")}>
              {retentionSig.significant ? "✓" : "~"}
            </span>
            <div>
              <p className="text-sm font-medium">Retention difference</p>
              <p className="text-xs text-white/40">
                z = {retentionSig.z.toFixed(2)} —{" "}
                <span className={retentionSig.significant ? "text-green-400" : "text-white/40"}>
                  {retentionSig.significant ? "Statistically significant (p < 0.05)" : "Not significant"}
                </span>
              </p>
            </div>
          </div>
          <div className={cn(
            "rounded-xl border p-4 flex items-center gap-3",
            completionSig?.significant ? "border-green-500/30 bg-green-500/10" : "border-white/10 bg-[#1C1F26]"
          )}>
            <span className={cn("text-lg", completionSig?.significant ? "text-green-400" : "text-white/40")}>
              {completionSig?.significant ? "✓" : "~"}
            </span>
            <div>
              <p className="text-sm font-medium">Completion difference</p>
              <p className="text-xs text-white/40">
                z = {completionSig?.z.toFixed(2)} —{" "}
                <span className={completionSig?.significant ? "text-green-400" : "text-white/40"}>
                  {completionSig?.significant ? "Statistically significant (p < 0.05)" : "Not significant"}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-side bar chart */}
      <div className="rounded-xl border border-white/10 bg-[#1C1F26] p-5">
        <h3 className="text-sm font-medium text-white/60 mb-4">Group comparison (scaled)</h3>
        {loading ? (
          <Skeleton className="h-56 w-full bg-white/10" />
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="metric" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "#1C1F26", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                  itemStyle={{ color: "#fff" }}
                  labelStyle={{ color: "rgba(255,255,255,0.6)" }}
                />
                <Legend formatter={(v) => <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Group {v}</span>} />
                <Bar dataKey="A" fill="#6b7280" radius={[4, 4, 0, 0]} maxBarSize={48} />
                <Bar dataKey="B" fill="#7F77DD" radius={[4, 4, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
