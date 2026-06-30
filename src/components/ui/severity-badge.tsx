import { cn } from "@/lib/utils";
import { Severity } from "@/lib/types";
import { AlertTriangle, AlertCircle, Info, CheckCircle } from "lucide-react";

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

const config: Record<Severity, { label: string; className: string; icon: React.ComponentType<{ className?: string }> }> = {
  critical: {
    label: "Critical",
    className: "border-severity-critical/30 bg-severity-critical/10 text-severity-critical",
    icon: AlertCircle,
  },
  high: {
    label: "High",
    className: "border-severity-high/30 bg-severity-high/10 text-severity-high",
    icon: AlertTriangle,
  },
  medium: {
    label: "Medium",
    className: "border-severity-medium/30 bg-severity-medium/10 text-severity-medium",
    icon: Info,
  },
  low: {
    label: "Low",
    className: "border-severity-low/30 bg-severity-low/10 text-severity-low",
    icon: CheckCircle,
  },
};

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const { label, className: colorClass, icon: Icon } = config[severity];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        colorClass,
        className
      )}
    >
      <Icon className="h-2.5 w-2.5" />
      {label}
    </span>
  );
}
