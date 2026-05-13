import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  trend?: number;
  loading?: boolean;
  accent?: boolean;
}

export function MetricCard({ label, value, sub, icon: Icon, trend, loading, accent }: MetricCardProps) {
  return (
    <div className={cn("rounded-xl border border-white/10 bg-[#1C1F26] p-5 space-y-3")}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-white/50 uppercase tracking-wider">{label}</span>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", accent ? "bg-[#7F77DD]/20" : "bg-white/5")}>
          <Icon className={cn("h-4 w-4", accent ? "text-[#7F77DD]" : "text-white/60")} />
        </div>
      </div>
      {loading ? (
        <Skeleton className="h-8 w-24 bg-white/10" />
      ) : (
        <div>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {sub && <p className="text-xs text-white/40 mt-1">{sub}</p>}
          {trend !== undefined && (
            <p className={cn("text-xs mt-1", trend >= 0 ? "text-green-400" : "text-red-400")}>
              {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% vs last period
            </p>
          )}
        </div>
      )}
    </div>
  );
}
