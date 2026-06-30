"use client";

import { useState } from "react";
import { useRepositories } from "@/hooks/useRepositories";
import { useIncidents } from "@/hooks/useIncidents";
import { usePredictions } from "@/hooks/usePredictions";
import { useRepoLogs } from "@/hooks/useRepoLogs";
import { RiskGauge } from "@/components/ui/risk-gauge";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { PipelineStageIndicator } from "@/components/ui/pipeline-stage-indicator";
import { ConfidenceMeter } from "@/components/ui/confidence-meter";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/loading-skeleton";
import { formatDistanceToNow } from "@/lib/utils";
import Link from "next/link";
import {
  ArrowLeft,
  GitBranch,
  GitCommit,
  GitFork,
  Activity,
  AlertTriangle,
  TrendingUp,
  Cpu,
  Clock,
  ExternalLink,
  CheckCircle,
  History,
  FileCode,
  Settings,
  PlusCircle,
} from "lucide-react";

interface RepoDetailClientProps {
  repoId: string;
}

type SubTab = "active" | "history" | "logs";

const LOG_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  commit: GitCommit,
  branch_created: GitBranch,
  settings_changed: Settings,
  import: FileCode,
};

const LOG_COLORS: Record<string, string> = {
  commit: "border-primary/20 bg-primary/10 text-primary",
  branch_created: "border-agent-running/20 bg-agent-running/10 text-agent-running",
  settings_changed: "border-severity-medium/20 bg-severity-medium/10 text-severity-medium",
  import: "border-agent-success/20 bg-agent-success/10 text-agent-success",
};

export function RepoDetailClient({ repoId }: RepoDetailClientProps) {
  const { repositories, loading: repoLoading } = useRepositories();
  const { incidents, loading: incLoading } = useIncidents({ repoId });
  const { predictions } = usePredictions();
  const { logs, loading: logsLoading } = useRepoLogs(repoId);
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("active");

  const repo = repositories.find((r) => r.id === repoId);
  const prediction = predictions.find((p) => p.repoId === repoId);

  if (repoLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
      </div>
    );
  }

  if (!repo) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="h-12 w-12 text-muted-foreground/30" />
        <h2 className="mt-4 text-lg font-semibold">Repository Not Found</h2>
        <Link href="/repositories" className="mt-4 text-sm text-primary hover:underline">
          ← Back to Repositories
        </Link>
      </div>
    );
  }

  const openIncidents = incidents.filter((i) => i.status !== "resolved");
  const resolvedIncidents = incidents.filter((i) => i.status === "resolved");

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/repositories" className="flex items-center gap-1 hover:text-foreground transition-colors">
          <ArrowLeft className="h-3 w-3" />
          Repositories
        </Link>
        <span>/</span>
        <span className="font-semibold text-primary">{repo.name}</span>
      </div>

      {/* Repo Header */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <GitFork className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">{repo.fullName}</h1>
            </div>
            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
              <span>Primary Language: <strong>{repo.primaryLanguage}</strong></span>
              <span>·</span>
              <span>Services monitored: <strong>{repo.servicesCount}</strong></span>
              <span>·</span>
              <span>Default Branch: <strong>{repo.defaultBranch}</strong></span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Deployment Risk</span>
              <span className={`text-base font-bold ${
                repo.riskScore >= 75 ? "text-severity-critical" : "text-agent-success"
              }`}>{repo.riskScore}/100</span>
            </div>
            <RiskGauge score={repo.riskScore} size="sm" showLabel={false} />
          </div>
        </div>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI 1: Failure Probability */}
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Failure Probability</h3>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          {prediction ? (
            <div>
              <p className="text-3xl font-bold">{prediction.failureProbability}%</p>
              <ConfidenceMeter confidence={prediction.failureProbability} className="mt-2" />
              <p className="text-[10px] text-muted-foreground mt-2">{prediction.recommendation}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No prediction model loaded.</p>
          )}
        </div>

        {/* KPI 2: Open Incidents */}
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Open Incidents</h3>
            <AlertTriangle className="h-4 w-4 text-severity-critical" />
          </div>
          <div>
            <p className="text-3xl font-bold text-severity-critical">{openIncidents.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Active events that require immediate attention
            </p>
          </div>
        </div>

        {/* KPI 3: System Stability */}
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stability Rating</h3>
            <Activity className="h-4 w-4 text-agent-success" />
          </div>
          <div>
            <p className="text-3xl font-bold text-agent-success">
              {repo.riskScore < 30 ? "Optimal" : repo.riskScore < 60 ? "Stable" : "At Risk"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Based on code churn, test gaps and recent failures
            </p>
          </div>
        </div>
      </div>

      {/* Tab controls */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        <div className="flex gap-1 rounded-md border border-border bg-muted/30 p-1 max-w-md">
          {[
            { id: "active", label: `Active Incidents (${openIncidents.length})` },
            { id: "history", label: `Incident History (${resolvedIncidents.length})` },
            { id: "logs", label: `Modification Logs (${logs.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as SubTab)}
              className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeSubTab === tab.id
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active Incidents list */}
        {activeSubTab === "active" && (
          <div>
            {openIncidents.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="mx-auto h-10 w-10 text-agent-success/40" />
                <p className="text-sm font-medium text-foreground mt-3">No active incidents found</p>
                <p className="text-xs text-muted-foreground mt-1">Systems are operating within normal limits.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {openIncidents.map((inc) => (
                  <Link
                    key={inc.id}
                    href={`/incidents/${inc.id}`}
                    className="flex items-center justify-between rounded-md border border-border bg-background/50 p-4 hover:border-primary/20 hover:bg-accent/20 group transition-colors"
                  >
                    <div>
                      <p className="text-sm font-semibold group-hover:text-primary transition-colors">{inc.title}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <SeverityBadge severity={inc.severity} />
                        <span className="text-muted-foreground/30">·</span>
                        <PipelineStageIndicator currentStage={inc.pipelineStage} />
                      </div>
                    </div>
                    <Clock className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Incident History list */}
        {activeSubTab === "history" && (
          <div>
            {resolvedIncidents.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="mx-auto h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm font-medium text-foreground mt-3">No resolved incidents found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {resolvedIncidents.map((inc) => (
                  <Link
                    key={inc.id}
                    href={`/incidents/${inc.id}`}
                    className="flex items-center justify-between rounded-md border border-border bg-background/50 p-4 hover:border-primary/20 hover:bg-accent/20 group transition-colors"
                  >
                    <div>
                      <p className="text-sm font-semibold group-hover:text-primary transition-colors">{inc.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Resolved {inc.resolvedAt ? formatDistanceToNow(inc.resolvedAt) : "recently"}
                      </p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-agent-success" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modification Logs list */}
        {activeSubTab === "logs" && (
          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="text-center py-12">
                <History className="mx-auto h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm font-medium text-foreground mt-3">No modification logs recorded</p>
              </div>
            ) : (
              <div className="relative border-l border-border pl-6 space-y-6 py-2 ml-4">
                {logs.map((log) => {
                  const LogIcon = LOG_ICONS[log.type] || GitCommit;
                  const logColor = LOG_COLORS[log.type] || "border-border bg-muted/20 text-muted-foreground";
                  return (
                    <div key={log.id} className="relative group">
                      {/* Timeline Dot Icon */}
                      <span className={`absolute -left-[38px] top-0 flex h-7.5 w-7.5 items-center justify-center rounded-full border bg-background text-[10px] ${logColor}`}>
                        <LogIcon className="h-3.5 w-3.5" />
                      </span>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-foreground">{log.title}</p>
                          <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(log.createdAt)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{log.description}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
                          <span className="capitalize">{log.type.replace(/_/g, " ")}</span>
                          <span>·</span>
                          <span>by {log.author}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
