"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, updateProfile as firebaseUpdateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { updateUserProfile } from "@/lib/firestore";
import { useAuthStore } from "@/store/auth-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogOut, Loader2, Save, Flame, Clock, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSessions } from "@/hooks/use-sessions";
import { formatDuration } from "@/lib/utils";

const goals = [5, 10, 15, 20, 30];

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, updateProfile, signOut: storeSignOut } = useAuthStore();
  const { sessions } = useSessions();
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [dailyGoal, setDailyGoal] = useState(String(user?.dailyGoal ?? 10));
  const [saving, setSaving] = useState(false);

  const totalMinutes = sessions.reduce((acc, s) => acc + s.duration, 0);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, { displayName, dailyGoal: Number(dailyGoal) });
      if (auth.currentUser) await firebaseUpdateProfile(auth.currentUser, { displayName });
      updateProfile({ displayName, dailyGoal: Number(dailyGoal) });
      toast({ title: "Profile saved!" });
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await signOut(auth);
    storeSignOut();
    router.replace("/login");
  }

  const initials = (user?.displayName ?? "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <Flame className="h-5 w-5 text-orange-500 mx-auto mb-1" />
            <p className="text-xl font-bold">{user?.streakDays ?? 0}</p>
            <p className="text-xs text-muted-foreground">Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Clock className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold">{formatDuration(totalMinutes)}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Calendar className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <p className="text-xl font-bold">{sessions.length}</p>
            <p className="text-xs text-muted-foreground">Sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Edit profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.photoURL} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.displayName}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              {user?.isAdmin && <Badge className="mt-1 text-xs">Admin</Badge>}
            </div>
          </div>

          <Separator />

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display name</Label>
              <Input
                id="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal">Daily goal</Label>
              <Select value={dailyGoal} onValueChange={setDailyGoal}>
                <SelectTrigger id="goal">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {goals.map((g) => (
                    <SelectItem key={g} value={String(g)}>
                      {g} minutes / day
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Interests */}
      {(user?.interests ?? []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your interests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user?.interests.map((i) => (
                <Badge key={i} variant="secondary" className="capitalize">
                  {i}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sign out */}
      <Button variant="outline" className="w-full text-destructive border-destructive/30 hover:bg-destructive/5" onClick={handleSignOut}>
        <LogOut className="h-4 w-4" />
        Sign out
      </Button>
    </div>
  );
}
