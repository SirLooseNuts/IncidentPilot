import { cn } from "@/lib/utils";
import { AgentStatus } from "@/lib/types";
import { Loader2, CheckCircle, XCircle, MinusCircle } from "lucide-react";

interface AgentStatusBadgeProps {
  status: AgentStatus;
  className?: string;
  showLabel?: boolean;
}

const config: Record<AgentStatus, { label: string; className: string; dotClass: string }> = {
  idle: {
    label: "Idle",
    className: "bg-agent-idle/10 text-agent-idle border-agent-idle/20",
    dotClass: "bg-agent-idle",
  },
  running: {
    label: "Running",
    className: "bg-agent-running/10 text-agent-running border-agent-running/20",
    dotClass: "bg-agent-running",
  },
  success: {
    label: "Success",
    className: "bg-agent-success/10 text-agent-success border-agent-success/20",
    dotClass: "bg-agent-success",
  },
  failed: {
    label: "Failed",
    className: "bg-agent-failed/10 text-agent-failed border-agent-failed/20",
    dotClass: "bg-agent-failed",
  },
};

const icons: Record<AgentStatus, React.ComponentType<{ className?: string }>> = {
  idle: MinusCircle,
  running: Loader2,
  success: CheckCircle,
  failed: XCircle,
};

export function AgentStatusBadge({ status, className, showLabel = true }: AgentStatusBadgeProps) {
  const { label, className: colorClass, dotClass } = config[status];
  const Icon = icons[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium",
        colorClass,
        className
      )}
    >
      <Icon
        className={cn(
          "h-3 w-3",
          status === "running" && "animate-spin"
        )}
      />
      {showLabel && label}
    </span>
  );
}

// Standalone dot indicator (used in lists/feeds)
export function AgentStatusDot({ status }: { status: AgentStatus }) {
  const { dotClass } = config[status];
  return (
    <span className="relative flex h-2 w-2">
      {status === "running" && (
        <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", dotClass)} />
      )}
      <span className={cn("relative inline-flex h-2 w-2 rounded-full", dotClass)} />
    </span>
  );
}
