import { Badge } from "@/components/ui/badge";
import { Wind, Brain, Focus } from "lucide-react";
import type { Session } from "@/types";
import { formatDate } from "@/lib/utils";

const typeConfig = {
  breathing: { label: "Breathing", icon: Wind, color: "bg-blue-50 text-blue-600 border-blue-200" },
  meditation: { label: "Meditation", icon: Brain, color: "bg-purple-50 text-purple-600 border-purple-200" },
  focus: { label: "Focus", icon: Focus, color: "bg-green-50 text-green-600 border-green-200" },
};

export function SessionCard({ session }: { session: Session }) {
  const config = typeConfig[session.sessionType];
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${config.color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium">{config.label}</p>
          <p className="text-xs text-muted-foreground">
            {formatDate(session.completedAt)}
          </p>
        </div>
      </div>
      <Badge variant="secondary" className="text-xs">
        {session.duration} min
      </Badge>
    </div>
  );
}
