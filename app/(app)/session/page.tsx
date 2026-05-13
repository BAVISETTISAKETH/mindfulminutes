"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { saveSession } from "@/lib/firestore";
import { useAuthStore } from "@/store/auth-store";
import { useSessionStore } from "@/store/session-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wind, Brain, Focus, Play, Pause, RotateCcw, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { SessionType } from "@/types";

const SESSION_TYPES: { id: SessionType; label: string; icon: React.ElementType; description: string; color: string }[] = [
  { id: "breathing", label: "Breathing", icon: Wind, description: "Calm your nervous system with guided breathwork", color: "border-blue-200 bg-blue-50 text-blue-600" },
  { id: "meditation", label: "Meditation", icon: Brain, description: "Quiet your mind and cultivate presence", color: "border-purple-200 bg-purple-50 text-purple-600" },
  { id: "focus", label: "Focus", icon: Focus, description: "Sharpen attention with targeted concentration", color: "border-green-200 bg-green-50 text-green-600" },
];

const DURATIONS = [5, 10, 15, 20];

type Phase = "setup" | "running" | "paused" | "done";

export default function SessionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { currentSessionType, currentDuration, setCurrentSessionType, setCurrentDuration } = useSessionStore();

  const [phase, setPhase] = useState<Phase>("setup");
  const [secondsLeft, setSecondsLeft] = useState(currentDuration * 60);
  const [saving, setSaving] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalSeconds = currentDuration * 60;
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  const tick = useCallback(() => {
    setSecondsLeft((prev) => {
      if (prev <= 1) {
        setPhase("done");
        return 0;
      }
      return prev - 1;
    });
  }, []);

  useEffect(() => {
    if (phase === "running") {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase, tick]);

  function start() {
    setSecondsLeft(currentDuration * 60);
    setPhase("running");
  }

  function togglePause() {
    setPhase((p) => (p === "running" ? "paused" : "running"));
  }

  function reset() {
    setPhase("setup");
    setSecondsLeft(currentDuration * 60);
  }

  async function handleComplete() {
    if (!user) return;
    setSaving(true);
    try {
      await saveSession(user.uid, currentSessionType, currentDuration);
      toast({ title: "Session complete! 🎉", description: `${currentDuration} minutes of ${currentSessionType} logged.` });
      router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  }

  const selectedType = SESSION_TYPES.find((t) => t.id === currentSessionType)!;
  const Icon = selectedType.icon;

  if (phase !== "setup") {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-8 pb-20 md:pb-0">
        <div className="text-center space-y-2">
          <Badge variant="outline" className={cn("px-4 py-1.5 text-sm", selectedType.color)}>
            <Icon className="h-3.5 w-3.5 mr-1.5" />
            {selectedType.label}
          </Badge>
        </div>

        {/* Timer ring */}
        <div className="relative flex items-center justify-center">
          <svg className="h-64 w-64 -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
            <circle
              cx="100" cy="100" r="90"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 90}`}
              strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute text-center">
            {phase === "done" ? (
              <div className="flex flex-col items-center gap-2">
                <Check className="h-12 w-12 text-primary" />
                <span className="text-lg font-semibold text-primary">Done!</span>
              </div>
            ) : (
              <>
                <span className={cn("text-5xl font-bold tabular-nums", phase === "running" && "animate-countdown")}>
                  {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
                </span>
                <p className="text-sm text-muted-foreground mt-1">
                  {phase === "paused" ? "Paused" : "remaining"}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {phase === "done" ? (
            <>
              <Button variant="outline" size="lg" onClick={reset}>
                <RotateCcw className="h-4 w-4" /> Again
              </Button>
              <Button size="lg" onClick={handleComplete} disabled={saving}>
                <Check className="h-4 w-4" />
                {saving ? "Saving…" : "Save session"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="icon" className="h-12 w-12" onClick={reset}>
                <RotateCcw className="h-5 w-5" />
              </Button>
              <Button size="lg" className="h-16 w-16 rounded-full" onClick={togglePause}>
                {phase === "running" ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-0.5" />}
              </Button>
            </>
          )}
        </div>

        {phase !== "done" && (
          <p className="text-sm text-muted-foreground">
            {selectedType.description}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold">New session</h1>
        <p className="text-muted-foreground mt-1">Choose your practice and duration</p>
      </div>

      {/* Session type */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Session type</p>
        <div className="grid gap-3">
          {SESSION_TYPES.map(({ id, label, icon: TIcon, description, color }) => (
            <button
              key={id}
              onClick={() => setCurrentSessionType(id)}
              className={cn(
                "flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all",
                currentSessionType === id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
              )}
            >
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border", color)}>
                <TIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              {currentSessionType === id && (
                <Check className="ml-auto h-5 w-5 text-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Duration</p>
        <div className="grid grid-cols-4 gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => setCurrentDuration(d)}
              className={cn(
                "flex flex-col items-center rounded-xl border-2 py-3 transition-all",
                currentDuration === d ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
              )}
            >
              <span className={cn("text-xl font-bold", currentDuration === d && "text-primary")}>
                {d}
              </span>
              <span className="text-xs text-muted-foreground">min</span>
            </button>
          ))}
        </div>
      </div>

      <Button className="w-full" size="lg" onClick={start}>
        <Play className="h-5 w-5" /> Start session
      </Button>
    </div>
  );
}
