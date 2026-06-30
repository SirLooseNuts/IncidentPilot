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
} from "lucide-react";
import { AgentRun } from "@/lib/types";

type AgentType = AgentRun["agentType"];

const agentConfig: Record<AgentType, {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  bgClass: string;
  textClass: string;
}> = {
  monitoring: {
    name: "Monitoring",
    icon: Shield,
    bgClass: "bg-severity-critical/10",
    textClass: "text-severity-critical",
  },
  context: {
    name: "Context",
    icon: Search,
    bgClass: "bg-agent-running/10",
    textClass: "text-agent-running",
  },
  root_cause: {
    name: "Root Cause",
    icon: Target,
    bgClass: "bg-severity-high/10",
    textClass: "text-severity-high",
  },
  recommendation: {
    name: "Recommendation",
    icon: Lightbulb,
    bgClass: "bg-severity-medium/10",
    textClass: "text-severity-medium",
  },
  patch: {
    name: "Patch",
    icon: Code2,
    bgClass: "bg-primary/10",
    textClass: "text-primary",
  },
  validation: {
    name: "Validation",
    icon: FlaskConical,
    bgClass: "bg-agent-success/10",
    textClass: "text-agent-success",
  },
  pr: {
    name: "PR",
    icon: GitPullRequest,
    bgClass: "bg-agent-success/15",
    textClass: "text-agent-success",
  },
  learning: {
    name: "Learning",
    icon: Brain,
    bgClass: "bg-agent-running/15",
    textClass: "text-agent-running",
  },
  prediction: {
    name: "Prediction",
    icon: TrendingUp,
    bgClass: "bg-severity-medium/10",
    textClass: "text-severity-medium",
  },
};

interface AgentAvatarProps {
  agentType: AgentType;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
}

export function AgentAvatar({ agentType, size = "md", showName = false, className }: AgentAvatarProps) {
  const config = agentConfig[agentType];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-11 w-11",
  };

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg",
          sizeClasses[size],
          config.bgClass
        )}
      >
        <Icon className={cn(iconSizes[size], config.textClass)} />
      </div>
      {showName && (
        <span className="text-sm font-medium text-foreground">{config.name} Agent</span>
      )}
    </div>
  );
}

export { agentConfig };
