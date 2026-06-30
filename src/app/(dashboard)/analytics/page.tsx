"use client";

import { useIncidents } from "@/hooks/useIncidents";
import { useRepositories } from "@/hooks/useRepositories";
import { useAgentRuns } from "@/hooks/useAgentRuns";
import { StatCard } from "@/components/ui/stat-card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Activity,
  Clock,
  CheckCircle2,
  TrendingUp,
  Brain,
  ShieldCheck,
} from "lucide-react";

// 7-day system incident trend
const incidentHistoryData = [
  { day: "Mon", incoming: 2, resolved: 3 },
  { day: "Tue", incoming: 4, resolved: 2 },
  { day: "Wed", incoming: 1, resolved: 2 },
  { day: "Thu", incoming: 5, resolved: 4 },
  { day: "Fri", incoming: 3, resolved: 3 },
  { day: "Sat", incoming: 1, resolved: 1 },
  { day: "Sun", incoming: 2, resolved: 2 },
];

// MTTR Trend over last 4 weeks (in minutes)
const mttrTrendData = [
  { week: "Week 1", mttr: 8.5 },
  { week: "Week 2", mttr: 6.2 },
  { week: "Week 3", mttr: 4.8 },
  { week: "Week 4", mttr: 4.2 },
];

const accuracyPieData = [
  { name: "First-attempt Fixes", value: 85, fill: "#10b981" },
  { name: "Refined by Agent", value: 11, fill: "#f59e0b" },
  { name: "Developer Override", value: 4, fill: "#f43f5e" },
];

const HEALTH_COLORS = ["#10b981", "#f59e0b", "#f43f5e"];

export default function AnalyticsPage() {
  const { incidents } = useIncidents();
  const { repositories } = useRepositories();
  const { agentRuns } = useAgentRuns();

  const totalIncidents = incidents.length;
  const resolvedIncidents = incidents.filter((i) => i.status === "resolved").length;
  const resolutionRate = totalIncidents > 0 ? Math.round((resolvedIncidents / totalIncidents) * 100) : 0;

  // Compute average pipeline execution duration (in seconds)
  const runsWithDuration = agentRuns.filter((r) => r.durationMs > 0);
  const avgAgentDurationSec = runsWithDuration.length > 0
    ? (runsWithDuration.reduce((sum, r) => sum + r.durationMs, 0) / runsWithDuration.length / 1000).toFixed(1)
    : "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Autonomous reliability metrics, MTTR, MTBF, and AI repair accuracy trackers (Phase 18)
        </p>
      </div>

      {/* Stats Cards row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: "Mean Time to Resolve (MTTR)",
            value: "4.2 min",
            delta: "-38% from last month",
            deltaType: "down" as const,
            icon: Clock,
            color: "text-agent-success"
          },
          {
            label: "Mean Time Between Failures",
            value: "18.5 hrs",
            delta: "+12% improvement",
            deltaType: "up" as const,
            icon: ShieldCheck,
            color: "text-primary"
          },
          {
            label: "AI Recommendation Accuracy",
            value: "96.1%",
            delta: "+1.5% this week",
            deltaType: "up" as const,
            icon: Brain,
            color: "text-agent-running"
          },
          {
            label: "Resolution Success Rate",
            value: `${resolutionRate}%`,
            delta: "+4% vs baseline",
            deltaType: "up" as const,
            icon: CheckCircle2,
            color: "text-agent-success"
          }
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-lg border border-border bg-card p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{card.label}</span>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold tracking-tight">{card.value}</p>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className={`font-semibold ${card.deltaType === "up" ? "text-agent-success" : "text-severity-critical"}`}>
                    {card.deltaType === "up" ? "↑" : "↓"} {card.delta}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Incident Trend Chart (2/3 width) */}
        <div className="lg:col-span-2 rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Incident Occurrence & Resolution Trend
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={incidentHistoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.2 0.01 250)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "oklch(0.5 0.01 250)" }} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "oklch(0.5 0.01 250)" }} axisLine={false} width={20} />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.12 0.01 250)",
                  border: "1px solid oklch(0.22 0.01 250)",
                  borderRadius: "8px",
                  fontSize: "11px",
                }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="incoming" name="New Failures" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="resolved" name="Resolved by AI" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* AI Accuracy Pie Chart (1/3 width) */}
        <div className="rounded-lg border border-border bg-card p-5 flex flex-col">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            AI Patch Efficiency
          </h2>
          <div className="flex-1 flex flex-col justify-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={accuracyPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {accuracyPieData.map((entry, index) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.12 0.01 250)",
                    border: "1px solid oklch(0.22 0.01 250)",
                    borderRadius: "8px",
                    fontSize: "11px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {accuracyPieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.fill }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-semibold">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: MTTR weekly progress */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* MTTR Progression line */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Mean Time to Resolution (MTTR) Weekly Progress
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={mttrTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.2 0.01 250)" />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: "oklch(0.5 0.01 250)" }} axisLine={false} />
              <YAxis unit="m" tick={{ fontSize: 10, fill: "oklch(0.5 0.01 250)" }} axisLine={false} width={25} />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.12 0.01 250)",
                  border: "1px solid oklch(0.22 0.01 250)",
                  borderRadius: "8px",
                  fontSize: "11px",
                }}
              />
              <Line type="monotone" dataKey="mttr" stroke="#10b981" strokeWidth={2} name="MTTR" activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Repository Stability Breakdown */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Repository Stability Index
          </h2>
          <div className="space-y-4">
            {repositories.map((repo) => {
              const isHealthy = repo.riskScore < 30;
              const isWarning = repo.riskScore >= 30 && repo.riskScore < 60;
              const statusColor = isHealthy ? "text-agent-success" : isWarning ? "text-severity-medium" : "text-severity-critical";
              return (
                <div key={repo.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold">{repo.fullName}</span>
                    <span className={`font-bold ${statusColor}`}>{100 - repo.riskScore}% Stability</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isHealthy ? "bg-agent-success" : isWarning ? "bg-severity-medium" : "bg-severity-critical"
                      }`}
                      style={{ width: `${100 - repo.riskScore}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
