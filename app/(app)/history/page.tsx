"use client";

import { useState, useMemo } from "react";
import { useSessions } from "@/hooks/use-sessions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SessionCard } from "@/components/app/session-card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Clock, Wind, Brain, Focus } from "lucide-react";
import { formatDuration, formatDate } from "@/lib/utils";
import type { SessionType } from "@/types";

const TYPE_FILTERS: { id: SessionType | "all"; label: string; icon?: React.ElementType }[] = [
  { id: "all", label: "All" },
  { id: "breathing", label: "Breathing", icon: Wind },
  { id: "meditation", label: "Meditation", icon: Brain },
  { id: "focus", label: "Focus", icon: Focus },
];

function getWeekLabel(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return formatDate(d);
}

export default function HistoryPage() {
  const { sessions, loading } = useSessions();
  const [filter, setFilter] = useState<SessionType | "all">("all");

  const filtered = useMemo(
    () => (filter === "all" ? sessions : sessions.filter((s) => s.sessionType === filter)),
    [sessions, filter]
  );

  const totalMinutes = filtered.reduce((acc, s) => acc + s.duration, 0);

  const weeklyData = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((s) => {
      const label = getWeekLabel(s.completedAt);
      map.set(label, (map.get(label) ?? 0) + s.duration);
    });
    return Array.from(map.entries())
      .map(([week, minutes]) => ({ week, minutes }))
      .reverse()
      .slice(-8);
  }, [filtered]);

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold">Session history</h1>
        <p className="text-muted-foreground mt-1">Track your mindfulness journey over time</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              {loading ? (
                <Skeleton className="h-6 w-16" />
              ) : (
                <p className="text-2xl font-bold">{formatDuration(totalMinutes)}</p>
              )}
              <p className="text-xs text-muted-foreground">Minutes logged</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <Brain className="h-5 w-5 text-green-600" />
            </div>
            <div>
              {loading ? (
                <Skeleton className="h-6 w-12" />
              ) : (
                <p className="text-2xl font-bold">{filtered.length}</p>
              )}
              <p className="text-xs text-muted-foreground">Sessions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Minutes per week</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : weeklyData.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              No data yet
            </div>
          ) : (
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(v) => v.split(" ").slice(0, 2).join(" ")}
                  />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: 12,
                    }}
                    formatter={(v: number) => [`${v} min`, "Minutes"]}
                  />
                  <Bar dataKey="minutes" fill="#7F77DD" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filter + list */}
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          {TYPE_FILTERS.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={filter === id ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(id)}
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
              {label}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <p className="text-muted-foreground">No sessions found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
