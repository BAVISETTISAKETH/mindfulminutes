"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSessions } from "@/hooks/use-sessions";
import { useAuthStore } from "@/store/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { WeeklyRingChart } from "@/components/app/weekly-ring-chart";
import { SessionCard } from "@/components/app/session-card";
import { Flame, Play, Clock, Calendar } from "lucide-react";
import { formatDuration } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { sessions, loading } = useSessions();

  useEffect(() => {
    if (user && !user.onboardingComplete) router.replace("/onboarding");
  }, [user, router]);

  const firstName = user?.displayName?.split(" ")[0] ?? "there";
  const recentSessions = sessions.slice(0, 5);
  const totalMinutes = sessions.reduce((acc, s) => acc + s.duration, 0);

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{greeting}, {firstName} 👋</h1>
          <p className="text-muted-foreground mt-1">
            {sessions.length === 0
              ? "Start your first session today."
              : `You've logged ${formatDuration(totalMinutes)} total.`}
          </p>
        </div>
        {(user?.streakDays ?? 0) > 0 && (
          <Badge variant="secondary" className="flex items-center gap-1 text-orange-600 bg-orange-50 border-orange-200 px-3 py-1.5">
            <Flame className="h-4 w-4" />
            {user?.streakDays} day streak
          </Badge>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatDuration(totalMinutes)}</p>
              <p className="text-xs text-muted-foreground">Total time</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{sessions.length}</p>
              <p className="text-xs text-muted-foreground">Sessions</p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{user?.streakDays ?? 0}</p>
              <p className="text-xs text-muted-foreground">Day streak</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick start + weekly ring */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick start */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base">Quick start</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 flex-1 justify-center py-6">
            <div className="animate-breathe flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
              <Play className="h-10 w-10 text-primary ml-1" />
            </div>
            <Button size="lg" className="w-full max-w-xs" asChild>
              <Link href="/session">Begin a session</Link>
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Daily goal: {user?.dailyGoal ?? 10} min/day
            </p>
          </CardContent>
        </Card>

        {/* Weekly activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">This week</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyRingChart sessions={sessions} />
          </CardContent>
        </Card>
      </div>

      {/* Recent sessions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent sessions</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/history">View all</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))
          ) : recentSessions.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <p className="text-muted-foreground text-sm">No sessions yet.</p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/session">Start your first session</Link>
              </Button>
            </div>
          ) : (
            recentSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
