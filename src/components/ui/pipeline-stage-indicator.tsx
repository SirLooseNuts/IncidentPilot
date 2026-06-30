import { cn } from "@/lib/utils";

const TOTAL_STAGES = 9;

interface PipelineStageIndicatorProps {
  currentStage: number; // 1-9
  className?: string;
}

export function PipelineStageIndicator({ currentStage, className }: PipelineStageIndicatorProps) {
  const stageLabels = [
    "Detect", "Investigate", "Explain", "Recommend",
    "Patch", "Validate", "PR", "Learn", "Predict",
  ];

  return (
    <div className={cn("flex items-center gap-0.5", className)} title={`Stage: ${stageLabels[currentStage - 1]}`}>
      {Array.from({ length: TOTAL_STAGES }).map((_, i) => {
        const stage = i + 1;
        return (
          <span
            key={stage}
            className={cn(
              "h-1.5 rounded-full transition-all",
              stage < currentStage
                ? "w-1.5 bg-agent-success"
                : stage === currentStage
                ? "w-3 bg-agent-running"
                : "w-1.5 bg-border"
            )}
          />
        );
      })}
      <span className="ml-1.5 text-[10px] font-medium text-muted-foreground">
        {stageLabels[currentStage - 1]}
      </span>
    </div>
  );
}
