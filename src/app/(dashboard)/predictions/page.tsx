"use client";

import { usePredictions } from "@/hooks/usePredictions";
import { useRepositories } from "@/hooks/useRepositories";
import { RiskGauge } from "@/components/ui/risk-gauge";
import { ConfidenceMeter } from "@/components/ui/confidence-meter";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { TrendingUp, AlertTriangle, ShieldCheck } from "lucide-react";

export default function PredictionsPage() {
  const { predictions, loading } = usePredictions();
  const { repositories } = useRepositories();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Predictions</h1>
        <p className="text-sm text-muted-foreground">
          AI-powered deployment risk forecasts for your next release
        </p>
      </div>

      {/* Summary Banner */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: "High Risk Repos",
            value: predictions.filter((p) => p.riskScore >= 60).length,
            icon: AlertTriangle,
            color: "text-severity-critical",
          },
          {
            label: "Average Fail Probability",
            value: predictions.length
              ? `${Math.round(predictions.reduce((a, p) => a + p.failureProbability, 0) / predictions.length)}%`
              : "—",
            icon: TrendingUp,
            color: "text-severity-medium",
          },
          {
            label: "Safe Repos",
            value: predictions.filter((p) => p.riskScore < 30).length,
            icon: ShieldCheck,
            color: "text-agent-success",
          },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
            <stat.icon className={`h-8 w-8 ${stat.color}`} />
            <div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Prediction Cards */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {[1, 2].map((i) => <CardSkeleton key={i} className="h-64" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {predictions.map((pred) => {
            const repo = repositories.find((r) => r.id === pred.repoId);

            const radarData = [
              { subject: "Code Churn", value: Math.round(pred.codeChurn * 100) },
              { subject: "Complexity", value: pred.complexityScore },
              { subject: "Risk Score", value: pred.riskScore },
              { subject: "Past Failures", value: Math.min(pred.previousFailures * 20, 100) },
              { subject: "Test Gap", value: 100 - pred.testCoverage },
            ];

            return (
              <div key={pred.id} className="rounded-lg border border-border bg-card p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-base font-semibold">
                      {repo?.fullName || pred.repoId}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {repo?.primaryLanguage} · {repo?.servicesCount} services
                    </p>
                  </div>
                  <RiskGauge score={pred.riskScore} size="sm" />
                </div>

                {/* Failure Probability bar */}
                <div className="mb-4 rounded-lg bg-muted/30 p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium">Failure Probability</span>
                    <span className={`text-sm font-bold ${
                      pred.failureProbability > 60 ? "text-severity-critical" :
                      pred.failureProbability > 40 ? "text-severity-high" : "text-agent-success"
                    }`}>
                      {pred.failureProbability}%
                    </span>
                  </div>
                  <ConfidenceMeter confidence={pred.failureProbability} />
                </div>

                {/* Radar + Stats side-by-side */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height={160}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="oklch(0.25 0.01 250)" />
                        <PolarAngleAxis
                          dataKey="subject"
                          tick={{ fontSize: 9, fill: "oklch(0.55 0.01 250)" }}
                        />
                        <Radar
                          dataKey="value"
                          stroke={pred.riskScore >= 60 ? "#f43f5e" : pred.riskScore >= 40 ? "#f97316" : "#10b981"}
                          fill={pred.riskScore >= 60 ? "#f43f5e" : pred.riskScore >= 40 ? "#f97316" : "#10b981"}
                          fillOpacity={0.15}
                          strokeWidth={1.5}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "oklch(0.12 0.01 250)",
                            border: "1px solid oklch(0.22 0.01 250)",
                            borderRadius: "8px",
                            fontSize: "11px",
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="shrink-0 space-y-2 text-right">
                    {[
                      { label: "Test Coverage", value: `${pred.testCoverage}%`, good: pred.testCoverage >= 80 },
                      { label: "Code Churn", value: `${Math.round(pred.codeChurn * 100)}%`, good: pred.codeChurn < 0.3 },
                      { label: "Complexity", value: `${pred.complexityScore}/100`, good: pred.complexityScore < 50 },
                      { label: "Past Failures", value: pred.previousFailures, good: pred.previousFailures === 0 },
                    ].map((s) => (
                      <div key={s.label}>
                        <p className="text-[9px] text-muted-foreground">{s.label}</p>
                        <p className={`text-xs font-bold ${s.good ? "text-agent-success" : "text-severity-high"}`}>
                          {s.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendation */}
                <div className="mt-3 rounded-md border border-primary/10 bg-primary/5 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1">AI Recommendation</p>
                  <p className="text-xs text-muted-foreground">{pred.recommendation}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
