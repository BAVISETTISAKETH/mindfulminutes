"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { Brain, LayoutDashboard, Users, TrendingDown, GitBranch, FlaskConical, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/analytics/overview", icon: LayoutDashboard, label: "Overview" },
  { href: "/analytics/retention", icon: TrendingDown, label: "Retention" },
  { href: "/analytics/funnel", icon: GitBranch, label: "Funnel" },
  { href: "/analytics/ab-test", icon: FlaskConical, label: "A/B Test" },
];

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuthStore();

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user?.isAdmin) return null;

  async function handleSignOut() {
    await signOut(auth);
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-[#0F1117] text-white flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-56 flex-col border-r border-white/10 p-4">
        <Link href="/analytics/overview" className="flex items-center gap-2 mb-8 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7F77DD]/20">
            <Brain className="h-4 w-4 text-[#7F77DD]" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">MindfulMinutes</p>
            <p className="text-xs text-white/40">Analytics</p>
          </div>
        </Link>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-[#7F77DD]/20 text-[#7F77DD]"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Users className="h-4 w-4" />
            User app
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0F1117] px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-[#7F77DD]">Analytics</span>
        <nav className="flex gap-1">
          {navItems.map(({ href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                pathname === href ? "bg-[#7F77DD]/20 text-[#7F77DD]" : "text-white/40 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6 pt-16 md:pt-6">
        {children}
      </main>
    </div>
  );
}
