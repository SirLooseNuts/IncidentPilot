"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaType?: "up" | "down" | "neutral";
  valueColor?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode; // For optional sparkline
}

export function StatCard({
  label,
  value,
  delta,
  deltaType = "neutral",
  valueColor,
  description,
  className,
  children,
}: StatCardProps) {
  const deltaColors = {
    up: "text-severity-critical",
    down: "text-agent-success",
    neutral: "text-muted-foreground",
  };

  const DeltaIcon = deltaType === "up" ? TrendingUp : deltaType === "down" ? TrendingDown : Minus;

  return (
    <div
      className={cn(
        "group rounded-lg border border-border bg-card p-5 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5",
        className
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="mt-2 flex items-end justify-between">
        <div>
          <p
            className={cn("text-3xl font-bold tabular-nums leading-none", valueColor || "text-foreground")}
          >
            {value}
          </p>
          {delta && (
            <div className={cn("mt-1.5 flex items-center gap-1 text-xs font-medium", deltaColors[deltaType])}>
              <DeltaIcon className="h-3 w-3" />
              {delta}
            </div>
          )}
          {description && !delta && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {children && <div className="h-12 w-24">{children}</div>}
      </div>
    </div>
  );
}
