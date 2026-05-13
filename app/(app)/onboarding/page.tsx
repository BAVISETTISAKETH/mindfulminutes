"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { completeOnboarding } from "@/lib/firestore";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Leaf, Focus, Wind, Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const interests = [
  { id: "stress", label: "Stress relief", icon: "🧘" },
  { id: "sleep", label: "Better sleep", icon: "😴" },
  { id: "focus", label: "Focus & clarity", icon: "🎯" },
  { id: "anxiety", label: "Anxiety", icon: "💙" },
  { id: "mood", label: "Mood boost", icon: "✨" },
  { id: "breath", label: "Breathwork", icon: "🌬️" },
];

const goals = [5, 10, 15, 20];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateProfile } = useAuthStore();
  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [dailyGoal, setDailyGoal] = useState(10);
  const [saving, setSaving] = useState(false);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (user?.onboardingComplete) router.replace("/dashboard");
  }, [user, router]);

  function toggleInterest(id: string) {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  async function finish() {
    if (!user) return;
    setSaving(true);
    const onboardingDuration = Math.round((Date.now() - startTime.current) / 60000);
    try {
      await completeOnboarding(user.uid, selectedInterests, dailyGoal, onboardingDuration);
      updateProfile({ onboardingComplete: true, interests: selectedInterests, dailyGoal, onboardingDuration });
      router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="mb-8 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Step {step} of 3</span>
            <span>{Math.round((step / 3) * 100)}%</span>
          </div>
          <Progress value={(step / 3) * 100} className="h-1.5" />
        </div>

        {/* Step 1 — Welcome */}
        {step === 1 && (
          <Card className="border-0 shadow-xl">
            <CardContent className="pt-8 pb-8 text-center space-y-6">
              <div className="flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
                  <Brain className="h-10 w-10 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">
                  Welcome, {user?.displayName?.split(" ")[0]}!
                </h1>
                <p className="text-muted-foreground">
                  You&apos;re about to start a mindfulness practice that fits into your daily life.
                  Let&apos;s take 2 minutes to personalise your experience.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 py-2">
                {[
                  { icon: Wind, label: "Breathing" },
                  { icon: Brain, label: "Meditation" },
                  { icon: Focus, label: "Focus" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted/50">
                    <Icon className="h-6 w-6 text-primary" />
                    <span className="text-xs font-medium">{label}</span>
                  </div>
                ))}
              </div>
              <Button className="w-full" onClick={() => setStep(2)}>
                Get started <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2 — Interests */}
        {step === 2 && (
          <Card className="border-0 shadow-xl">
            <CardContent className="pt-8 pb-8 space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">What brings you here?</h2>
                <p className="text-sm text-muted-foreground">Choose all that apply</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {interests.map(({ id, label, icon }) => (
                  <button
                    key={id}
                    onClick={() => toggleInterest(id)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border-2 p-3 text-left text-sm font-medium transition-all",
                      selectedInterests.includes(id)
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <span className="text-lg">{icon}</span>
                    {label}
                    {selectedInterests.includes(id) && (
                      <Check className="ml-auto h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button className="flex-1" onClick={() => setStep(3)}>
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3 — Daily goal */}
        {step === 3 && (
          <Card className="border-0 shadow-xl">
            <CardContent className="pt-8 pb-8 space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Set your daily goal</h2>
                <p className="text-sm text-muted-foreground">
                  How many minutes do you want to practice each day?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {goals.map((g) => (
                  <button
                    key={g}
                    onClick={() => setDailyGoal(g)}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-xl border-2 p-5 transition-all",
                      dailyGoal === g
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <span className={cn("text-3xl font-bold", dailyGoal === g && "text-primary")}>
                      {g}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">min / day</span>
                    {dailyGoal === g && <Leaf className="h-4 w-4 text-primary mt-2" />}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button className="flex-1" onClick={finish} disabled={saving}>
                  {saving ? "Saving…" : "Let's go! 🎉"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
