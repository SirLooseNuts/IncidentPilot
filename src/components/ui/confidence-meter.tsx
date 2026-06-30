import { cn } from "@/lib/utils";

interface ConfidenceMeterProps {
  confidence: number; // 0-100
  showLabel?: boolean;
  className?: string;
  size?: "sm" | "md";
}

function getConfidenceColor(confidence: number) {
  if (confidence >= 80) return { bar: "bg-agent-success", text: "text-agent-success" };
  if (confidence >= 60) return { bar: "bg-severity-medium", text: "text-severity-medium" };
  return { bar: "bg-severity-critical", text: "text-severity-critical" };
}

export function ConfidenceMeter({ confidence, showLabel = true, className, size = "md" }: ConfidenceMeterProps) {
  const { bar, text } = getConfidenceColor(confidence);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("flex-1 rounded-full bg-muted", size === "sm" ? "h-1" : "h-1.5")}>
        <div
          className={cn("h-full rounded-full transition-all duration-500", bar)}
          style={{ width: `${confidence}%` }}
        />
      </div>
      {showLabel && (
        <span className={cn("shrink-0 font-mono font-semibold", text, size === "sm" ? "text-[10px]" : "text-xs")}>
          {confidence}%
        </span>
      )}
    </div>
  );
}
