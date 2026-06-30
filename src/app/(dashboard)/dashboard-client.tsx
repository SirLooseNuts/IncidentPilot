"use client";

import { useIncidents } from "@/hooks/useIncidents";
import { useRepositories } from "@/hooks/useRepositories";
import { usePredictions } from "@/hooks/usePredictions";
import { useAgentRuns } from "@/hooks/useAgentRuns";
import { StatCard } from "@/components/ui/stat-card";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { PipelineFlow } from "@/components/ui/pipeline-flow";
import { PipelineStageIndicator } from "@/components/ui/pipeline-stage-indicator";
import { AgentAvatar } from "@/components/ui/agent-avatar";
import { AgentStatusBadge } from "@/components/ui/agent-status-badge";
import { ConfidenceMeter } from "@/components/ui/confidence-meter";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Link from "next/link";
import { AlertTriangle, Zap, Clock, Activity } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";
import { toast } from "sonner";
import { triggerInvestigation } from "@/lib/agents/trigger";

// Sparkline data (last 7 days)
const riskTrendData = [
  { day: "Mon", risk: 42 },
  { day: "Tue", risk: 55 },
  { day: "Wed", risk: 61 },
  { day: "Thu", risk: 58 },
  { day: "Fri", risk: 72 },
  { day: "Sat", risk: 78 },
  { day: "Sun", risk: 71 },
];

const resolutionSparkData = [
  { day: "Mon", val: 8 },
  { day: "Tue", val: 5 },
  { day: "Wed", val: 3 },
  { day: "Thu", val: 6 },
  { day: "Fri", val: 4 },
  { day: "Sat", val: 4.2 },
  { day: "Sun", val: 4.2 },
];

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#f43f5e",
  high: "#f97316",
  medium: "#f59e0b",
  low: "#10b981",
};

export function DashboardClient() {
  const { incidents, loading: incLoading } = useIncidents();
  const { repositories } = useRepositories();
  const { predictions } = usePredictions();
  const { agentRuns, loading: agentLoading } = useAgentRuns();

  // Compute KPIs
  const openIncidents = incidents.filter(
    (i) => i.status !== "resolved"
  ).length;
  const activeInvestigations = incidents.filter(
    (i) => i.status === "investigating" || i.status === "root_caused"
  ).length;

  // Severity distribution for pie chart
  const severityCounts = ["critical", "high", "medium", "low"].map((sev) => ({
    name: sev,
    value: incidents.filter((i) => i.severity === sev && i.status !== "resolved").length,
  })).filter((s) => s.value > 0);

  // Stage distribution across pipeline
  const stageCounts: number[] = Array(9).fill(0);
  incidents.filter((i) => i.status !== "resolved").forEach((i) => {
    if (i.pipelineStage >= 1 && i.pipelineStage <= 9) {
      stageCounts[i.pipelineStage - 1]++;
    }
  });

  const highRiskPrediction = predictions.find((p) => p.failureProbability > 60);
  const recentRuns = [...agentRuns]
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, 8);

  const handleTriggerInvestigation = async () => {
    toast.loading("Starting investigation pipeline...");
    await triggerInvestigation();
    toast.dismiss();
    toast.success("Investigation triggered!", {
      description: "Monitoring Agent has started analyzing the new incident.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Command Center</h1>
          <p className="text-sm text-muted-foreground">
            Real-time overview of your autonomous SRE pipeline
          </p>
        </div>
        <button
          onClick={handleTriggerInvestigation}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 active:scale-95"
        >
          <Zap className="h-4 w-4" />
          Trigger Investigation
        </button>
      </div>

      {/* High-risk prediction banner */}
      {highRiskPrediction && (
        <div className="flex items-center gap-3 rounded-lg border border-severity-high/20 bg-severity-high/5 px-4 py-3">
          <AlertTriangle className="h-4 w-4 shrink-0 text-severity-high" />
          <p className="text-sm text-severity-high">
            <strong>Prediction Alert:</strong>{" "}
            {repositories.find((r) => r.id === highRiskPrediction.repoId)?.name || "A repository"} has{" "}
            <strong>{highRiskPrediction.failureProbability}% failure probability</strong> for the next deployment.{" "}
            <Link href="/predictions" className="underline underline-offset-2 hover:no-underline">
              View details →
            </Link>
          </p>
        </div>
      )}

      {/* KPI Cards */}
      {incLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Open Incidents"
            value={openIncidents}
            delta="+1 from yesterday"
            deltaType="up"
            valueColor="text-severity-critical"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskTrendData}>
                <Area type="monotone" dataKey="risk" stroke="#f43f5e" fill="#f43f5e20" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </StatCard>

          <StatCard
            label="Active Investigations"
            value={activeInvestigations}
            delta="0 change"
            deltaType="neutral"
            valueColor="text-agent-running"
          />

          <StatCard
            label="Avg Resolution"
            value="4.2m"
            delta="-38% vs last week"
            deltaType="down"
            valueColor="text-agent-success"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={resolutionSparkData}>
                <Area type="monotone" dataKey="val" stroke="#10b981" fill="#10b98120" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </StatCard>

          <StatCard
            label="Deployment Risk"
            value="78%"
            delta="+5% this week"
            deltaType="up"
            valueColor="text-severity-medium"
          />
        </div>
      )}

      {/* Autonomous Pipeline */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Autonomous Pipeline
          </h2>
          <span className="text-xs text-muted-foreground">
            {stageCounts.filter((c) => c > 0).length} stages active
          </span>
        </div>
        <p className="mb-5 text-xs text-muted-foreground">
          Incidents across all 9 autonomous agents
        </p>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          <PipelineFlow currentStage={4} />
        </div>
        {/* Per-stage counts */}
        <div className="mt-4 grid grid-cols-9 gap-1">
          {stageCounts.map((count, i) => (
            <div key={i} className="text-center">
              <div className={`text-sm font-bold ${count > 0 ? "text-primary" : "text-muted-foreground/30"}`}>
                {count || "—"}
              </div>
              <div className="text-[8px] text-muted-foreground/50">{i + 1}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main two-column section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Incidents — 2/3 width */}
        <div className="lg:col-span-2 rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Recent Incidents
            </h2>
            <Link
              href="/incidents"
              className="text-xs text-primary hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {incidents.slice(0, 5).map((incident) => (
              <Link
                key={incident.id}
                href={`/incidents/${incident.id}`}
                className="flex items-center justify-between rounded-md border border-border bg-background/50 px-4 py-3 transition-colors hover:border-primary/20 hover:bg-accent/30 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <SeverityBadge severity={incident.severity} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium group-hover:text-primary transition-colors">
                      {incident.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {incident.repoId.replace("repo_", "")}
                      </span>
                      <span className="text-muted-foreground/40">·</span>
                      <PipelineStageIndicator currentStage={incident.pipelineStage} />
                    </div>
                  </div>
                </div>
                <span className="ml-4 shrink-0 text-xs text-muted-foreground">
                  {formatDistanceToNow(incident.createdAt)}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Severity Distribution — 1/3 width */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Severity Distribution
          </h2>
          {severityCounts.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={severityCounts}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {severityCounts.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={SEVERITY_COLORS[entry.name]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.12 0.01 250)",
                      border: "1px solid oklch(0.22 0.01 250)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1.5">
                {severityCounts.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: SEVERITY_COLORS[entry.name] }}
                      />
                      <span className="capitalize text-muted-foreground">{entry.name}</span>
                    </div>
                    <span className="font-semibold">{entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Activity className="h-8 w-8 text-muted-foreground/30" />
              <p className="mt-2 text-xs text-muted-foreground">No open incidents</p>
            </div>
          )}
        </div>
      </div>

      {/* Risk Trend + AI Agent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Deployment Risk Trend */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Deployment Risk Trend
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={riskTrendData}>
              <defs>
                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: "oklch(0.6 0.01 250)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: "oklch(0.6 0.01 250)" }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.12 0.01 250)",
                  border: "1px solid oklch(0.22 0.01 250)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              formatter={(val) => [`${val ?? ""}%`, "Risk Score"]}
              />
              <Area
                type="monotone"
                dataKey="risk"
                stroke="#f59e0b"
                fill="url(#riskGrad)"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI Agent Activity Feed */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              AI Agent Activity
            </h2>
            <Link href="/ai-activity" className="text-xs text-primary hover:underline">
              View all →
            </Link>
          </div>
          {agentLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="h-8 w-8 rounded-lg bg-muted" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2.5 w-3/4 rounded bg-muted" />
                    <div className="h-2 w-1/2 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {recentRuns.map((run) => (
                <div
                  key={run.id}
                  className="flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-accent/30"
                >
                  <AgentAvatar agentType={run.agentType} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-medium">{run.agentName}</p>
                      <AgentStatusBadge status={run.status} showLabel={false} />
                    </div>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {run.incidentId} · {run.outputSummary.slice(0, 60)}…
                    </p>
                    {run.status === "success" && run.confidence && (
                      <ConfidenceMeter confidence={run.confidence} size="sm" className="mt-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
