"use client";

import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { getAnalyticsSummary, getDauData } from "@/lib/firestore";
import type { AnalyticsSummary, DauDataPoint } from "@/types";
import { MetricCard } from "@/components/analytics/metric-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Activity, Clock, TrendingUp } from "lucide-react";
const SESSION_TYPES = [
  { name: "Meditation", value: 38, color: "#7F77DD" },
  { name: "Breathing", value: 35, color: "#9b8fe6" },
  { name: "Focus", value: 27, color: "#cbc6f5" },
];

function ChartCard({ title, children, loading }: { title: string; children: React.ReactNode; loading?: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#1C1F26] p-5">
      <h3 className="text-sm font-medium text-white/60 mb-4">{title}</h3>
      {loading ? <Skeleton className="h-48 w-full bg-white/10" /> : children}
    </div>
  );
}

// Generate 30-day DAU data client-side if Firestore has no data yet
function generateFallbackDau(): DauDataPoint[] {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const base = 1200 + Math.floor(Math.sin(i / 3) * 300 + Math.random() * 200);
    return { date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), dau: base };
  });
}

export default function OverviewPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [dau, setDau] = useState<DauDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAnalyticsSummary(), getDauData()])
      .then(([s, d]) => {
        setSummary(s);
        setDau(d.length ? d : generateFallbackDau());
      })
      .finally(() => setLoading(false));
  }, []);

  const fallbackSummary = {
    totalUsers: 50000,
    totalSessions: 2850000,
    avgSessionDuration: 12.4,
    retention90Day: 31.2,
  };

  const s = summary ?? fallbackSummary;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-white/40 mt-1 text-sm">Key metrics across all users</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Users"
          value={loading ? "—" : s.totalUsers.toLocaleString()}
          icon={Users}
          trend={8.4}
          loading={loading}
          accent
        />
        <MetricCard
          label="Total Sessions"
          value={loading ? "—" : (s.totalSessions / 1_000_000).toFixed(2) + "M"}
          icon={Activity}
          trend={12.1}
          loading={loading}
        />
        <MetricCard
          label="Avg Session"
          value={loading ? "—" : `${s.avgSessionDuration.toFixed(1)} min`}
          icon={Clock}
          trend={2.3}
          loading={loading}
        />
        <MetricCard
          label="90-Day Retention"
          value={loading ? "—" : `${s.retention90Day.toFixed(1)}%`}
          sub="of users active at day 90"
          icon={TrendingUp}
          trend={-1.2}
          loading={loading}
        />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* DAU line chart — takes 2/3 */}
        <div className="lg:col-span-2">
          <ChartCard title="Daily Active Users — last 30 days" loading={loading}>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dau} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }}
                    tickLine={false}
                    interval={4}
                  />
                  <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#1C1F26", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                    itemStyle={{ color: "#7F77DD" }}
                    labelStyle={{ color: "rgba(255,255,255,0.6)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="dau"
                    stroke="#7F77DD"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "#7F77DD" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Session type donut — 1/3 */}
        <ChartCard title="Session type breakdown">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SESSION_TYPES}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {SESSION_TYPES.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  iconSize={8}
                  formatter={(value) => (
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{value}</span>
                  )}
                />
                <Tooltip
                  contentStyle={{ background: "#1C1F26", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                  itemStyle={{ color: "#fff" }}
                  formatter={(v: number) => [`${v}%`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
