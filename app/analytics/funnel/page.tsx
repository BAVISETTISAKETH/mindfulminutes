"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { getFunnelData } from "@/lib/firestore";
import type { FunnelStep } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

function generateFunnelData(): FunnelStep[] {
  const steps = [
    { name: "Signed up", value: 50000 },
    { name: "Started onboarding", value: 43500 },
    { name: "Completed onboarding", value: 31200 },
    { name: "First session", value: 22800 },
    { name: "Day 7 active", value: 14400 },
  ];
  return steps.map((s, i) => ({
    ...s,
    dropoffPct: i > 0 ? Math.round((1 - s.value / steps[i - 1].value) * 100) : 0,
  }));
}

const BAR_COLORS = ["#7F77DD", "#9b8fe6", "#b3aaee", "#cbc6f5", "#dedad9"];

export default function FunnelPage() {
  const [steps, setSteps] = useState<FunnelStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFunnelData()
      .then((d) => setSteps(d.length ? d : generateFunnelData()))
      .finally(() => setLoading(false));
  }, []);

  const maxValue = steps[0]?.value ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Onboarding Funnel</h1>
        <p className="text-white/40 mt-1 text-sm">Where users drop off in the onboarding flow</p>
      </div>

      {/* Funnel chart */}
      <div className="rounded-xl border border-white/10 bg-[#1C1F26] p-5">
        <h3 className="text-sm font-medium text-white/60 mb-6">Funnel — absolute users</h3>
        {loading ? (
          <Skeleton className="h-72 w-full bg-white/10" />
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={steps}
                layout="vertical"
                margin={{ top: 4, right: 120, left: 140, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={135}
                  tick={{ fontSize: 11, fill: "rgba(255,255,255,0.6)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{ background: "#1C1F26", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                  itemStyle={{ color: "#fff" }}
                  labelStyle={{ color: "rgba(255,255,255,0.6)" }}
                  formatter={(v: number) => [v.toLocaleString(), "Users"]}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={40}>
                  {steps.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                  <LabelList
                    dataKey="value"
                    position="right"
                    formatter={(v: number) => v.toLocaleString()}
                    style={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Step cards */}
      <div className="grid gap-3">
        {steps.map((step, i) => {
          const convPct = Math.round((step.value / maxValue) * 100);
          return (
            <div key={step.name} className="rounded-xl border border-white/10 bg-[#1C1F26] p-4 flex items-center gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
                style={{ background: BAR_COLORS[i] + "33", color: BAR_COLORS[i] }}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-medium">{step.name}</p>
                  <p className="text-sm font-bold">{step.value.toLocaleString()}</p>
                </div>
                <div className="h-1.5 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${convPct}%`, background: BAR_COLORS[i] }}
                  />
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold">{convPct}%</p>
                {step.dropoffPct !== undefined && step.dropoffPct > 0 && (
                  <p className="text-xs text-red-400">−{step.dropoffPct}%</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
