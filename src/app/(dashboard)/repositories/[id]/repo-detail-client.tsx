"use client";

import { useState } from "react";
import { useRepositories } from "@/hooks/useRepositories";
import { useIncidents } from "@/hooks/useIncidents";
import { usePredictions } from "@/hooks/usePredictions";
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
} from "lucide-react";

interface RepoDetailClientProps {
  repoId: string;
}

export function RepoDetailClient({ repoId }: RepoDetailClientProps) {
  const { repositories, loading: repoLoading } = useRepositories();
  const { incidents, loading: incLoading } = useIncidents({ repoId });
  const { predictions } = usePredictions();

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

      {/* Incidents lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Open */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Active Incidents ({openIncidents.length})
          </h2>
          {openIncidents.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-8 w-8 text-agent-success/40" />
              <p className="text-xs text-muted-foreground mt-2">No active incidents found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {openIncidents.map((inc) => (
                <Link
                  key={inc.id}
                  href={`/incidents/${inc.id}`}
                  className="flex items-center justify-between rounded-md border border-border bg-background/50 p-3 hover:bg-accent/30 group"
                >
                  <div>
                    <p className="text-xs font-semibold group-hover:text-primary transition-colors">{inc.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <SeverityBadge severity={inc.severity} />
                      <PipelineStageIndicator currentStage={inc.pipelineStage} />
                    </div>
                  </div>
                  <Clock className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Resolved */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Incident History ({resolvedIncidents.length})
          </h2>
          {resolvedIncidents.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No resolved incidents found.</p>
          ) : (
            <div className="space-y-2">
              {resolvedIncidents.map((inc) => (
                <Link
                  key={inc.id}
                  href={`/incidents/${inc.id}`}
                  className="flex items-center justify-between rounded-md border border-border bg-background/50 p-3 hover:bg-accent/30 group animate-fade-in"
                >
                  <div>
                    <p className="text-xs font-semibold group-hover:text-primary transition-colors">{inc.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Resolved {inc.resolvedAt ? formatDistanceToNow(inc.resolvedAt) : "recently"}
                    </p>
                  </div>
                  <CheckCircle className="h-3.5 w-3.5 text-agent-success" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
