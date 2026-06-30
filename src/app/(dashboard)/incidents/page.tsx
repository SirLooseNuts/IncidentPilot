"use client";

import { useState } from "react";
import { useIncidents } from "@/hooks/useIncidents";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { PipelineStageIndicator } from "@/components/ui/pipeline-stage-indicator";
import { EmptyState } from "@/components/ui/empty-state";
import { IncidentCardSkeleton } from "@/components/ui/loading-skeleton";
import { Severity, IncidentStatus } from "@/lib/types";
import { formatDistanceToNow } from "@/lib/utils";
import Link from "next/link";
import {
  GitCommit,
  User2,
  GitBranch,
  Filter,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

const SEVERITY_FILTERS: { label: string; value: Severity | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

const STATUS_FILTERS: { label: string; value: IncidentStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Detected", value: "detected" },
  { label: "Investigating", value: "investigating" },
  { label: "Root Caused", value: "root_caused" },
  { label: "Patched", value: "patched" },
  { label: "Validated", value: "validated" },
  { label: "PR Created", value: "pr_created" },
  { label: "Resolved", value: "resolved" },
];

const STATUS_COLORS: Record<string, string> = {
  detected: "text-severity-critical border-severity-critical/30 bg-severity-critical/10",
  investigating: "text-agent-running border-agent-running/30 bg-agent-running/10",
  root_caused: "text-severity-high border-severity-high/30 bg-severity-high/10",
  patched: "text-severity-medium border-severity-medium/30 bg-severity-medium/10",
  validated: "text-agent-success border-agent-success/30 bg-agent-success/10",
  pr_created: "text-primary border-primary/30 bg-primary/10",
  resolved: "text-muted-foreground border-border bg-muted/20",
};

export default function IncidentsPage() {
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | "all">("all");

  const { incidents, loading } = useIncidents({
    severity: severityFilter !== "all" ? [severityFilter] : undefined,
    status: statusFilter !== "all" ? [statusFilter] : undefined,
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Incidents</h1>
        <p className="text-sm text-muted-foreground">
          All detected failures across your repositories
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card px-4 py-3">
        {/* Severity */}
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Severity</span>
          <div className="flex gap-1">
            {SEVERITY_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setSeverityFilter(f.value)}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                  severityFilter === f.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        {/* Divider */}
        <div className="h-4 w-px bg-border" />
        {/* Status */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Status</span>
          <div className="flex flex-wrap gap-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                  statusFilter === f.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {loading ? "Loading..." : `${incidents.length} incident${incidents.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Incidents table */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => <IncidentCardSkeleton key={i} />)}
        </div>
      ) : incidents.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          heading="No incidents found"
          description="No incidents match your current filters. Try adjusting the severity or status filters."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Incident
                </th>
                <th className="hidden px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">
                  Severity
                </th>
                <th className="hidden px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">
                  Status
                </th>
                <th className="hidden px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground xl:table-cell">
                  Pipeline
                </th>
                <th className="hidden px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">
                  Commit
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Age
                </th>
                <th className="w-8 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {incidents.map((incident) => (
                <tr
                  key={incident.id}
                  className="group transition-colors hover:bg-accent/20"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-1">
                      <Link
                        href={`/incidents/${incident.id}`}
                        className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1"
                      >
                        {incident.title}
                      </Link>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span className="font-mono font-bold text-primary/70">{incident.id}</span>
                        </span>
                        <span className="hidden items-center gap-1 md:flex">
                          <User2 className="h-3 w-3" />
                          {incident.author}
                        </span>
                        <span className="hidden items-center gap-1 sm:flex">
                          <GitBranch className="h-3 w-3" />
                          {incident.branch}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3.5 md:table-cell">
                    <SeverityBadge severity={incident.severity} />
                  </td>
                  <td className="hidden px-4 py-3.5 lg:table-cell">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${
                        STATUS_COLORS[incident.status] || "text-muted-foreground border-border"
                      }`}
                    >
                      {incident.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3.5 xl:table-cell">
                    <PipelineStageIndicator currentStage={incident.pipelineStage} />
                  </td>
                  <td className="hidden px-4 py-3.5 lg:table-cell">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <GitCommit className="h-3 w-3" />
                      <span className="font-mono">{incident.commitSha}</span>
                    </div>
                    <p className="mt-0.5 max-w-[180px] truncate text-[10px] text-muted-foreground/60">
                      {incident.commitMessage}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">
                    {formatDistanceToNow(incident.createdAt)}
                  </td>
                  <td className="px-4 py-3.5">
                    <Link href={`/incidents/${incident.id}`}>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/40 transition-colors group-hover:text-primary" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
