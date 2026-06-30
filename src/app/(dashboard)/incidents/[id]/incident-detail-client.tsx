"use client";

import { useState } from "react";
import { useIncident } from "@/hooks/useIncident";
import { useAgentRuns } from "@/hooks/useAgentRuns";
import { useRepositories } from "@/hooks/useRepositories";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { AgentStatusBadge } from "@/components/ui/agent-status-badge";
import { AgentAvatar } from "@/components/ui/agent-avatar";
import { ConfidenceMeter } from "@/components/ui/confidence-meter";
import { DiffViewer } from "@/components/ui/diff-viewer";
import { CodeBlock } from "@/components/ui/code-block";
import { IncidentTimeline } from "@/components/ui/pipeline-flow";
import { formatDistanceToNow, formatDuration } from "@/lib/utils";
import { Skeleton } from "@/components/ui/loading-skeleton";
import Link from "next/link";
import {
  ArrowLeft,
  GitCommit,
  GitBranch,
  User2,
  ExternalLink,
  CheckCircle,
  XCircle,
  Target,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Clock,
  Cpu,
  AlertTriangle,
  ShieldCheck,
  GitPullRequest,
  Clipboard,
} from "lucide-react";

interface IncidentDetailClientProps {
  incidentId: string;
}

type Tab = "investigation" | "evidence" | "patch" | "timeline";

export function IncidentDetailClient({ incidentId }: IncidentDetailClientProps) {
  const {
    incident,
    evidence,
    rootCause,
    recommendations,
    patch,
    validation,
    pullRequest,
    loading,
  } = useIncident(incidentId);
  const { agentRuns } = useAgentRuns(incidentId);
  const { repositories } = useRepositories();
  const [activeTab, setActiveTab] = useState<Tab>("investigation");
  const [expandedRun, setExpandedRun] = useState<string | null>(null);
  const [persona, setPersona] = useState<"junior" | "senior" | "manager" | "cto">("senior");

  const repo = incident ? repositories.find((r) => r.id === incident.repoId) : null;

  const getPersonaExplanation = (id: string, p: typeof persona): string => {
    const explanations: Record<string, Record<typeof persona, string>> = {
      "INC-001": {
        junior: "A global event listener was added to `NotificationSettingsView` in `notification-manager.ts:147` but was never cleaned up. V8 couldn't garbage collect the view instance, causing memory to leak until the process crashed with an Out of Memory error.",
        senior: "Memory leak caused by missing event listener cleanup on unmount. NotificationSettingsView hooks `notificationEmitter` during initialization but fails to run `.off()`. This keeps view closures referenced in heap, leaking ~18MB/min until V8 limits abort thread runtime.",
        manager: "A bug in the notification Preferences component is leaking server memory, triggering service recycles and momentary response delays for users under high traffic. It is resolved by ensuring event cleanup.",
        cto: "Risk vector: leak in notifications component. Leak bounds V8 scope references, raising garbage collection overhead, triggering autoscaler density recycles. Mitigated with standard cleanup handlers with zero performance latency impact."
      },
      "INC-002": {
        junior: "We held onto database pool connections while loading heavy machine learning models. Because loading models is slow, we ran out of connections for other database actions, causing database lockouts.",
        senior: "PG pool starvation caused by blocking I/O calls. Thread scheduler holds open database transactions while loading model weights. Moving heavy network weight initialization context outside the transaction block mitigates pool exhaustion.",
        manager: "Database lockouts were caused by worker threads loading machine learning models during database transactions. Resolved by separating model load logic from databases query transactions.",
        cto: "Pool exhaustion mitigation: Transaction lifecycle isolation. Separated heavy ML deserialization boundaries from Postgres pool connections, restoring normal thread execution margins and eliminating db request queues."
      },
      "INC-003": {
        junior: "Stripe signature validation failed during signature key rotation. Because there was no try-catch block wrapping the constructEvent call, the stripe verify exception crashed the payment process immediately.",
        senior: "UnhandledPromiseRejection in Stripe webhook constructs. Inability to capture SignatureVerification exception during token rotation results in thread runtime termination. Fixed by introducing explicit error catcher wrappers mapping exception responses to 400 Bad Request.",
        manager: "Payment transactions failed to process during Stripe webhook signature rotations, crashing the payment gateway. The fix implements an error boundary logging signature mismatches without crashing.",
        cto: "Webhook exception control: Cryptographic verification errors are caught inside Express controllers. Restores gateway resilience during manual stripe key changes. Monitored via standard alert hooks."
      },
      "INC-004": {
        junior: "The ML model accuracy dropped below limits because the data scaler artifact is 90 days out of date, meaning production input normalization calculations mismatch model parameters.",
        senior: "Model drift drift rate +3.2%/week caused by stale feature normalization values. Input distribution shift on `user_age` normalizer mismatches StandardScaler fit limits. Corrected by rebuilding scaler on recent 30-day production logs data.",
        manager: "ML classification predictions accuracy dropped below standard benchmarks. Corrected by retraining dataset feature normalizers using current production data parameters.",
        cto: "Accuracy validation: Model drift resolved via normalization fit pipeline updates. Restored classifier accuracy metric to 0.91 on verification benchmarks, eliminating prediction bias regressions."
      },
      "INC-005": {
        junior: "API requests bypassed rate limits because our configuration keys didn't map correctly, meaning we served data requests instead of dropping them with HTTP 429 Too Many Requests.",
        senior: "Rate limiting middleware bypass caused by invalid key mapping. Redis check query keys defaulted to empty context during cache lookup. Fixed by enforcing key verification fallback rules.",
        manager: "API security check let users exceed standard rate limits without blocking. Fixed by correcting limits cache checks in payment controllers.",
        cto: "Enforcement validation: Redis rate-limiter logic corrected to prevent resource abuse. Standard key checks enforced on middleware boundaries, restoring 429 response rate checks."
      }
    };

    const incidentKey = explanations[id] ? id : "INC-001";
    return explanations[incidentKey]?.[p] || explanations["INC-001"]![p];
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="grid grid-cols-3 gap-4 mt-6">
          <Skeleton className="h-[500px]" />
          <Skeleton className="col-span-2 h-[500px]" />
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="h-12 w-12 text-muted-foreground/30" />
        <h2 className="mt-4 text-lg font-semibold">Incident Not Found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The incident{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{incidentId}</code>{" "}
          does not exist.
        </p>
        <Link
          href="/incidents"
          className="mt-4 text-sm text-primary hover:underline"
        >
          ← Back to Incidents
        </Link>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "investigation", label: "Investigation" },
    { id: "evidence", label: `Evidence (${evidence.length})` },
    { id: "patch", label: "Patch & Fix" },
    { id: "timeline", label: `Agent Timeline (${agentRuns.length})` },
  ];

  return (
    <div className="space-y-5">
      {/* Breadcrumb + back */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/incidents" className="flex items-center gap-1 hover:text-foreground transition-colors">
          <ArrowLeft className="h-3 w-3" />
          Incidents
        </Link>
        <span>/</span>
        <span className="font-mono text-primary">{incident.id}</span>
      </div>

      {/* Header */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <SeverityBadge severity={incident.severity} />
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${
                  incident.status === "resolved"
                    ? "border-agent-success/30 bg-agent-success/10 text-agent-success"
                    : incident.status === "pr_created"
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-agent-running/30 bg-agent-running/10 text-agent-running"
                }`}
              >
                {incident.status.replace(/_/g, " ")}
              </span>
            </div>
            <h1 className="mt-2 text-xl font-bold leading-tight">{incident.title}</h1>
            {/* Metadata row */}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <GitCommit className="h-3.5 w-3.5" />
                <code className="font-mono text-foreground/70">{incident.commitSha}</code>
              </span>
              <span className="flex items-center gap-1.5">
                <GitBranch className="h-3.5 w-3.5" />
                {incident.branch}
              </span>
              <span className="flex items-center gap-1.5">
                <User2 className="h-3.5 w-3.5" />
                {incident.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {formatDistanceToNow(incident.createdAt)}
              </span>
              {repo && (
                <span className="flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5" />
                  {repo.fullName}
                </span>
              )}
            </div>
            {/* Commit message */}
            <div className="mt-3 rounded-md bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Commit:</span>{" "}
              {incident.commitMessage}
            </div>
          </div>
          {/* Right: PR Link */}
          {pullRequest && (
            <a
              href={pullRequest.prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
            >
              <GitPullRequest className="h-3.5 w-3.5" />
              PR #{pullRequest.prNumber}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {/* Main layout: Left timeline + Right content */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        {/* Left: Pipeline Timeline */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Pipeline Stages
          </h2>
          <IncidentTimeline
            currentStage={incident.pipelineStage}
            onStageClick={(stage) => {
              if (stage <= incident.pipelineStage) {
                setActiveTab("timeline");
              }
            }}
          />
        </div>

        {/* Right: Tabs content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Investigation Tab */}
          {activeTab === "investigation" && (
            <div className="space-y-4">
              {/* Root Cause */}
              {rootCause ? (
                <div className="rounded-lg border border-border bg-card p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-severity-high/10">
                      <Target className="h-3.5 w-3.5 text-severity-high" />
                    </div>
                    <h2 className="text-sm font-semibold">Root Cause Analysis</h2>
                    <span className="ml-auto text-xs text-muted-foreground">
                      Confidence: {rootCause.confidence}%
                    </span>
                  </div>
                  <ConfidenceMeter confidence={rootCause.confidence} className="mb-4" />
                  <div className="rounded-lg bg-severity-critical/5 border border-severity-critical/10 px-4 py-3 mb-4">
                    <p className="text-xs font-semibold text-severity-critical uppercase tracking-wider mb-1">Primary Cause</p>
                    <p className="text-sm font-medium">{rootCause.primaryCause}</p>
                  </div>
                  {rootCause.secondaryCauses.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Contributing Factors
                      </p>
                      <ul className="space-y-1.5">
                        {rootCause.secondaryCauses.map((cause, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-severity-medium" />
                            {cause}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      AI Reasoning
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">{rootCause.reasoning}</p>
                  </div>

                  {/* Phase 9: Multi-Persona Human Explanation */}
                  <div className="border-t border-border/60 pt-4 mt-4 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Persona Explanations (Phase 9)
                    </p>
                    <div className="flex gap-1 rounded-md border border-border bg-muted/20 p-0.5 max-w-sm">
                      {[
                        { id: "junior", label: "Junior Dev" },
                        { id: "senior", label: "Senior SRE" },
                        { id: "manager", label: "Manager" },
                        { id: "cto", label: "CTO" },
                      ].map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setPersona(p.id as any)}
                          className={`flex-1 rounded py-1 text-[10px] font-medium transition-colors ${
                            persona === p.id
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                    <div className="rounded-md bg-muted/10 border border-border/40 p-3 text-xs leading-relaxed text-foreground/90">
                      {getPersonaExplanation(incident.id, persona)}
                    </div>
                  </div>

                  {rootCause.affectedServices.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {rootCause.affectedServices.map((svc) => (
                        <span key={svc} className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                          {svc}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-5 text-sm text-muted-foreground">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-agent-running" />
                  Root Cause Agent is still analyzing this incident…
                </div>
              )}

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <div className="rounded-lg border border-border bg-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-severity-medium/10">
                      <Lightbulb className="h-3.5 w-3.5 text-severity-medium" />
                    </div>
                    <h2 className="text-sm font-semibold">Recommendations</h2>
                  </div>
                  <div className="space-y-3">
                    {recommendations.map((rec) => (
                      <div
                        key={rec.id}
                        className={`rounded-lg border p-4 transition-all ${
                          rec.accepted
                            ? "border-agent-success/30 bg-agent-success/5"
                            : "border-border bg-background/50 hover:border-primary/20"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[9px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5 border ${
                                rec.type === "immediate"
                                  ? "border-severity-critical/30 bg-severity-critical/10 text-severity-critical"
                                  : rec.type === "safer"
                                  ? "border-severity-medium/30 bg-severity-medium/10 text-severity-medium"
                                  : "border-primary/30 bg-primary/10 text-primary"
                              }`}>
                                {rec.type}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                Effort: {rec.effort} · Risk: {rec.risk}
                              </span>
                              {rec.accepted && (
                                <span className="ml-auto flex items-center gap-1 text-[10px] text-agent-success">
                                  <CheckCircle className="h-3 w-3" />
                                  Accepted
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-medium">{rec.title}</p>
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{rec.description}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <ConfidenceMeter confidence={rec.confidence} size="sm" className="w-20" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Evidence Tab */}
          {activeTab === "evidence" && (
            <div className="space-y-4">
              {evidence.length === 0 ? (
                <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-8 text-sm text-muted-foreground justify-center">
                  No evidence collected yet for this incident.
                </div>
              ) : (
                evidence.map((ev) => (
                  <div key={ev.id} className="rounded-lg border border-border bg-card p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        ev.type === "log"
                          ? "border-severity-medium/30 bg-severity-medium/10 text-severity-medium"
                          : ev.type === "trace"
                          ? "border-severity-critical/30 bg-severity-critical/10 text-severity-critical"
                          : ev.type === "workflow"
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-agent-running/30 bg-agent-running/10 text-agent-running"
                      }`}>
                        {ev.type}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">{ev.id}</span>
                    </div>
                    <CodeBlock
                      code={ev.content}
                      language={ev.type === "workflow" ? "yaml" : "log"}
                      maxHeight="300px"
                    />
                  </div>
                ))
              )}
            </div>
          )}

          {/* Patch & Fix Tab */}
          {activeTab === "patch" && (
            <div className="space-y-4">
              {patch ? (
                <>
                  {/* Patch explanation */}
                  <div className="rounded-lg border border-border bg-card p-5">
                    <h3 className="mb-2 text-sm font-semibold">Patch Explanation</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{patch.explanation}</p>
                    {patch.sideEffects && (
                      <div className="mt-3 flex items-start gap-2 rounded-md border border-severity-medium/20 bg-severity-medium/5 p-3">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-severity-medium" />
                        <p className="text-xs text-severity-medium">{patch.sideEffects}</p>
                      </div>
                    )}
                  </div>

                  {/* Diff */}
                  <div className="rounded-lg border border-border bg-card p-5">
                    <h3 className="mb-3 text-sm font-semibold">Generated Diff</h3>
                    <DiffViewer diff={patch.diff} affectedFiles={patch.affectedFiles} />
                  </div>

                  {/* Validation report */}
                  {validation && (
                    <div className="rounded-lg border border-border bg-card p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                          validation.overallStatus === "passed"
                            ? "bg-agent-success/10"
                            : "bg-severity-critical/10"
                        }`}>
                          {validation.overallStatus === "passed" ? (
                            <ShieldCheck className="h-3.5 w-3.5 text-agent-success" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-severity-critical" />
                          )}
                        </div>
                        <h3 className="text-sm font-semibold">Sandbox Validation</h3>
                        <span className={`ml-auto text-xs font-semibold ${
                          validation.overallStatus === "passed"
                            ? "text-agent-success"
                            : "text-severity-critical"
                        }`}>
                          {validation.overallStatus.toUpperCase()}
                        </span>
                      </div>
                      {/* Validation stats */}
                      <div className="grid grid-cols-4 gap-3 mb-4">
                        {[
                          { label: "Tests Passed", value: validation.testsPassed, color: "text-agent-success" },
                          { label: "Tests Failed", value: validation.testsFailed, color: validation.testsFailed > 0 ? "text-severity-critical" : "text-muted-foreground" },
                          { label: "Lint", value: validation.lintStatus, color: validation.lintStatus === "passed" ? "text-agent-success" : "text-severity-critical" },
                          { label: "Security", value: validation.securityStatus, color: validation.securityStatus === "passed" ? "text-agent-success" : "text-severity-critical" },
                        ].map((stat) => (
                          <div key={stat.label} className="rounded-lg bg-muted/30 p-3 text-center">
                            <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                          </div>
                        ))}
                      </div>
                      <CodeBlock code={validation.report} language="log" maxHeight="200px" showLineNumbers={false} />
                    </div>
                  )}

                  {/* PR Card */}
                  {pullRequest && (
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <GitPullRequest className="h-4 w-4 text-primary" />
                          <h3 className="text-sm font-semibold text-primary">Pull Request Created</h3>
                        </div>
                        <a
                          href={pullRequest.prUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          PR #{pullRequest.prNumber}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <p className="text-sm font-medium mb-2">{pullRequest.title}</p>
                      <div className="rounded-md bg-background/50 border border-border p-3">
                        <pre className="text-[11px] leading-5 text-muted-foreground whitespace-pre-wrap">{pullRequest.body}</pre>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card py-12 text-center">
                  <div className="h-2 w-2 mb-3 rounded-full bg-agent-running animate-pulse" />
                  <p className="text-sm text-muted-foreground">
                    {incident.pipelineStage < 5
                      ? "Patch generation will begin after root cause analysis completes."
                      : "Patch Agent is generating a fix…"}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Agent Timeline Tab */}
          {activeTab === "timeline" && (
            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Agent Execution Log
              </h2>
              {agentRuns.length === 0 ? (
                <p className="text-sm text-muted-foreground">No agent runs recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {agentRuns.map((run) => (
                    <div key={run.id} className="overflow-hidden rounded-lg border border-border bg-background/50">
                      {/* Run header */}
                      <button
                        onClick={() => setExpandedRun(expandedRun === run.id ? null : run.id)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-accent/20 transition-colors"
                      >
                        <AgentAvatar agentType={run.agentType} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold">{run.agentName}</p>
                            <AgentStatusBadge status={run.status} showLabel={false} />
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate">{run.outputSummary || run.inputSummary}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {run.confidence > 0 && (
                            <span className="text-[10px] font-mono text-muted-foreground">
                              {run.confidence}% conf
                            </span>
                          )}
                          {run.durationMs > 0 && (
                            <span className="text-[10px] text-muted-foreground">
                              {formatDuration(run.durationMs)}
                            </span>
                          )}
                          {expandedRun === run.id ? (
                            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </div>
                      </button>
                      {/* Expanded details */}
                      {expandedRun === run.id && (
                        <div className="border-t border-border px-4 py-3 space-y-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Input</p>
                            <p className="text-xs text-muted-foreground">{run.inputSummary}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Output</p>
                            <p className="text-xs text-muted-foreground">{run.outputSummary || "In progress…"}</p>
                          </div>
                          {run.confidence > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Confidence</p>
                              <ConfidenceMeter confidence={run.confidence} />
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                            <span>Started: {new Date(run.startedAt).toLocaleTimeString()}</span>
                            {run.completedAt && (
                              <span>Completed: {new Date(run.completedAt).toLocaleTimeString()}</span>
                            )}
                            {run.durationMs > 0 && <span>Duration: {formatDuration(run.durationMs)}</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
