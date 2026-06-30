"use client";

import { useAgentRuns } from "@/hooks/useAgentRuns";
import { useIncidents } from "@/hooks/useIncidents";
import { AgentAvatar } from "@/components/ui/agent-avatar";
import { AgentStatusBadge } from "@/components/ui/agent-status-badge";
import { ConfidenceMeter } from "@/components/ui/confidence-meter";
import { formatDistanceToNow, formatDuration } from "@/lib/utils";
import Link from "next/link";
import {
  Activity,
  CheckCircle,
  XCircle,
  Loader2,
  MinusCircle,
  BarChart3,
} from "lucide-react";

export default function AIActivityPage() {
  const { agentRuns, loading } = useAgentRuns();
  const { incidents } = useIncidents();

  // Compute stats
  const successCount = agentRuns.filter((r) => r.status === "success").length;
  const failedCount = agentRuns.filter((r) => r.status === "failed").length;
  const runningCount = agentRuns.filter((r) => r.status === "running").length;
  const avgConfidence =
    successCount > 0
      ? Math.round(
          agentRuns
            .filter((r) => r.status === "success" && r.confidence > 0)
            .reduce((sum, r) => sum + r.confidence, 0) / successCount
        )
      : 0;
  const avgDuration =
    agentRuns.filter((r) => r.durationMs > 0).length > 0
      ? Math.round(
          agentRuns.filter((r) => r.durationMs > 0).reduce((sum, r) => sum + r.durationMs, 0) /
            agentRuns.filter((r) => r.durationMs > 0).length
        )
      : 0;

  // Group by agent type for the summary
  const agentTypeStats = [
    "monitoring", "context", "root_cause", "recommendation",
    "patch", "validation", "pr", "learning", "prediction",
  ].map((type) => {
    const runs = agentRuns.filter((r) => r.agentType === type);
    const successRate = runs.length > 0
      ? Math.round((runs.filter((r) => r.status === "success").length / runs.length) * 100)
      : 0;
    return { type: type as any, runs: runs.length, successRate };
  }).filter((s) => s.runs > 0);

  const sortedRuns = [...agentRuns].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Activity</h1>
        <p className="text-sm text-muted-foreground">
          Real-time view of all 9 autonomous agents across your incident pipeline
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "Total Runs", value: agentRuns.length, icon: Activity, color: "text-foreground" },
          { label: "Successful", value: successCount, icon: CheckCircle, color: "text-agent-success" },
          { label: "Failed", value: failedCount, icon: XCircle, color: "text-severity-critical" },
          { label: "Avg Confidence", value: `${avgConfidence}%`, icon: BarChart3, color: "text-primary" },
          { label: "Avg Duration", value: formatDuration(avgDuration), icon: Loader2, color: "text-agent-running" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-card p-4 text-center">
            <stat.icon className={`mx-auto mb-1 h-4 w-4 ${stat.color}`} />
            <p className={`text-xl font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Agent Type Breakdown */}
      {agentTypeStats.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Agent Performance Breakdown
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {agentTypeStats.map((stat) => (
              <div
                key={stat.type}
                className="flex flex-col items-center gap-2 rounded-lg border border-border bg-background/50 p-3 text-center"
              >
                <AgentAvatar agentType={stat.type} size="md" />
                <div>
                  <p className="text-xs font-semibold capitalize">{stat.type.replace("_", " ")}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.runs} runs</p>
                </div>
                <ConfidenceMeter confidence={stat.successRate} size="sm" className="w-full" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Run Log */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Live Agent Run Log
        </h2>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-9 w-9 rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 rounded bg-muted" />
                  <div className="h-2 w-1/2 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Agent</th>
                  <th className="hidden px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">Incident</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="hidden px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">Output</th>
                  <th className="hidden px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">Confidence</th>
                  <th className="hidden px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground xl:table-cell">Duration</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedRuns.map((run) => {
                  const incident = incidents.find((i) => i.id === run.incidentId);
                  return (
                    <tr key={run.id} className="transition-colors hover:bg-accent/10">
                      <td className="px-4 py-3">
                        <AgentAvatar agentType={run.agentType} size="sm" showName />
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        {incident ? (
                          <Link
                            href={`/incidents/${incident.id}`}
                            className="font-mono text-primary hover:underline"
                          >
                            {incident.id}
                          </Link>
                        ) : (
                          <span className="font-mono text-muted-foreground">{run.incidentId}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <AgentStatusBadge status={run.status} />
                      </td>
                      <td className="hidden px-4 py-3 max-w-xs md:table-cell">
                        <p className="truncate text-muted-foreground">
                          {run.outputSummary || run.inputSummary}
                        </p>
                      </td>
                      <td className="hidden px-4 py-3 lg:table-cell">
                        {run.confidence > 0 ? (
                          <ConfidenceMeter confidence={run.confidence} size="sm" className="w-24" />
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </td>
                      <td className="hidden px-4 py-3 xl:table-cell">
                        {run.durationMs > 0 ? (
                          <span className="font-mono text-muted-foreground">{formatDuration(run.durationMs)}</span>
                        ) : (
                          <span className="flex items-center gap-1 text-agent-running">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            running
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDistanceToNow(run.startedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
