"use client";

import { useMemo } from "react";
import { RadialBarChart, RadialBar, ResponsiveContainer, Legend } from "recharts";
import type { Session } from "@/types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const COLORS = ["#7F77DD", "#9b8fe6", "#b3aaee", "#cbc6f5", "#dedad9", "#e8e6f0", "#f0eef8"];

export function WeeklyRingChart({ sessions }: { sessions: Session[] }) {
  const data = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const byDay = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      const next = new Date(day);
      next.setDate(day.getDate() + 1);

      const mins = sessions
        .filter((s) => {
          const d = s.completedAt;
          return d >= day && d < next;
        })
        .reduce((acc, s) => acc + s.duration, 0);

      return {
        name: DAYS[i],
        minutes: mins,
        fill: COLORS[i],
      };
    });

    return byDay.filter((d) => d.minutes > 0);
  }, [sessions]);

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        No activity this week
      </div>
    );
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="30%"
          outerRadius="90%"
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar
            dataKey="minutes"
            cornerRadius={4}
            background={{ fill: "#f1f0fb" }}
          />
          <Legend
            iconSize={8}
            layout="vertical"
            verticalAlign="middle"
            align="right"
            formatter={(value) => (
              <span className="text-xs text-muted-foreground">{value}</span>
            )}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}
