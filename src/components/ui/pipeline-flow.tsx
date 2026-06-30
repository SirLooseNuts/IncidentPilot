import { cn } from "@/lib/utils";
import {
  Shield,
  Search,
  Target,
  Lightbulb,
  Code2,
  FlaskConical,
  GitPullRequest,
  Brain,
  TrendingUp,
  Check,
  X,
} from "lucide-react";

const PIPELINE_STAGES = [
  { label: "Detect", icon: Shield, shortLabel: "1" },
  { label: "Investigate", icon: Search, shortLabel: "2" },
  { label: "Explain", icon: Target, shortLabel: "3" },
  { label: "Recommend", icon: Lightbulb, shortLabel: "4" },
  { label: "Patch", icon: Code2, shortLabel: "5" },
  { label: "Validate", icon: FlaskConical, shortLabel: "6" },
  { label: "PR", icon: GitPullRequest, shortLabel: "7" },
  { label: "Learn", icon: Brain, shortLabel: "8" },
  { label: "Predict", icon: TrendingUp, shortLabel: "9" },
];

interface PipelineFlowProps {
  currentStage: number; // 1-9, the current active stage
  failedStage?: number; // Optional — if a stage failed
  compact?: boolean; // compact = no labels
  className?: string;
}

export function PipelineFlow({ currentStage, failedStage, compact = false, className }: PipelineFlowProps) {
  return (
    <div className={cn("flex items-center gap-1 overflow-x-auto", className)}>
      {PIPELINE_STAGES.map((stage, index) => {
        const stageNum = index + 1;
        const Icon = stage.icon;
        const isCompleted = stageNum < currentStage && stageNum !== failedStage;
        const isActive = stageNum === currentStage;
        const isFailed = stageNum === failedStage;
        const isPending = stageNum > currentStage;

        return (
          <div key={stage.label} className="flex items-center gap-1">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex items-center justify-center rounded-full border-2 transition-all",
                  compact ? "h-7 w-7" : "h-9 w-9",
                  isCompleted && "border-agent-success bg-agent-success/10 text-agent-success",
                  isActive && "border-agent-running bg-agent-running/10 text-agent-running animate-pulse",
                  isFailed && "border-severity-critical bg-severity-critical/10 text-severity-critical",
                  isPending && "border-border bg-card text-muted-foreground/40"
                )}
              >
                {isCompleted ? (
                  <Check className={compact ? "h-3 w-3" : "h-4 w-4"} />
                ) : isFailed ? (
                  <X className={compact ? "h-3 w-3" : "h-4 w-4"} />
                ) : (
                  <Icon className={compact ? "h-3 w-3" : "h-4 w-4"} />
                )}
              </div>
              {!compact && (
                <span
                  className={cn(
                    "text-[9px] font-medium uppercase tracking-wide",
                    isCompleted && "text-agent-success",
                    isActive && "text-agent-running",
                    isFailed && "text-severity-critical",
                    isPending && "text-muted-foreground/40"
                  )}
                >
                  {stage.label}
                </span>
              )}
            </div>
            {/* Connector line */}
            {index < PIPELINE_STAGES.length - 1 && (
              <div
                className={cn(
                  "h-0.5 shrink-0",
                  compact ? "w-3" : "w-5",
                  stageNum < currentStage ? "bg-agent-success" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Vertical timeline variant for the incident detail page
interface IncidentTimelineProps {
  currentStage: number;
  failedStage?: number;
  onStageClick?: (stage: number) => void;
  className?: string;
}

export function IncidentTimeline({ currentStage, failedStage, onStageClick, className }: IncidentTimelineProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {PIPELINE_STAGES.map((stage, index) => {
        const stageNum = index + 1;
        const Icon = stage.icon;
        const isCompleted = stageNum < currentStage && stageNum !== failedStage;
        const isActive = stageNum === currentStage;
        const isFailed = stageNum === failedStage;
        const isPending = stageNum > currentStage;

        return (
          <div key={stage.label} className="flex flex-col items-center">
            <button
              onClick={() => onStageClick?.(stageNum)}
              disabled={isPending}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all",
                isCompleted && "hover:bg-agent-success/5",
                isActive && "bg-agent-running/5 border border-agent-running/20",
                isFailed && "hover:bg-severity-critical/5",
                isPending && "cursor-default opacity-40"
              )}
            >
              {/* Stage icon circle */}
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
                  isCompleted && "border-agent-success bg-agent-success/10 text-agent-success",
                  isActive && "border-agent-running bg-agent-running/10 text-agent-running",
                  isFailed && "border-severity-critical bg-severity-critical/10 text-severity-critical",
                  isPending && "border-border bg-card text-muted-foreground/30"
                )}
              >
                {isCompleted ? (
                  <Check className="h-3.5 w-3.5" />
                ) : isFailed ? (
                  <X className="h-3.5 w-3.5" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
              </div>
              {/* Label */}
              <div>
                <p
                  className={cn(
                    "text-xs font-semibold",
                    isCompleted && "text-agent-success",
                    isActive && "text-agent-running",
                    isFailed && "text-severity-critical",
                    isPending && "text-muted-foreground/40"
                  )}
                >
                  {stage.label}
                </p>
                <p className="text-[10px] text-muted-foreground/60">
                  {isCompleted ? "Completed" : isActive ? "In progress..." : isFailed ? "Failed" : "Pending"}
                </p>
              </div>
            </button>

            {/* Connector */}
            {index < PIPELINE_STAGES.length - 1 && (
              <div
                className={cn(
                  "ml-7 w-0.5 self-start",
                  "h-3",
                  stageNum < currentStage ? "bg-agent-success" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
