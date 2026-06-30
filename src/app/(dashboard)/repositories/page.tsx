"use client";

import { useRepositories } from "@/hooks/useRepositories";
import { useIncidents } from "@/hooks/useIncidents";
import { usePredictions } from "@/hooks/usePredictions";
import { RiskGauge } from "@/components/ui/risk-gauge";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { formatDistanceToNow } from "@/lib/utils";
import Link from "next/link";
import {
  GitFork,
  Code2,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity,
  ChevronRight,
} from "lucide-react";

const LANG_COLORS: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-400",
  Python: "bg-emerald-500",
  Go: "bg-cyan-400",
  Rust: "bg-orange-500",
  Java: "bg-red-500",
};

export default function RepositoriesPage() {
  const { repositories, loading } = useRepositories();
  const { incidents } = useIncidents();
  const { predictions } = usePredictions();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Repositories</h1>
        <p className="text-sm text-muted-foreground">
          Risk analysis and incident history across all connected repositories
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => <CardSkeleton key={i} className="h-48" />)}
        </div>
      ) : repositories.length === 0 ? (
        <EmptyState
          icon={GitFork}
          heading="No repositories connected"
          description="Connect a GitHub repository to start monitoring deployments."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {repositories.map((repo) => {
            const prediction = predictions.find((p) => p.repoId === repo.id);
            const repoIncidents = incidents.filter(
              (i) => i.repoId === repo.id && i.status !== "resolved"
            );
            const criticalCount = repoIncidents.filter((i) => i.severity === "critical").length;

            return (
              <Link
                key={repo.id}
                href={`/repositories/${repo.id}`}
                className="group rounded-lg border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${LANG_COLORS[repo.primaryLanguage] || "bg-muted"}`}
                      />
                      <h2 className="truncate text-sm font-semibold group-hover:text-primary transition-colors">
                        {repo.fullName}
                      </h2>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>{repo.primaryLanguage}</span>
                      <span>·</span>
                      <span>{repo.servicesCount} services</span>
                      <span>·</span>
                      <span className={`font-medium ${
                        repo.status === "active"
                          ? "text-agent-success"
                          : repo.status === "analyzing"
                          ? "text-agent-running"
                          : "text-muted-foreground"
                      }`}>
                        {repo.status}
                      </span>
                    </div>
                  </div>
                  <RiskGauge score={repo.riskScore} size="sm" showLabel={false} />
                </div>

                {/* Risk score bar */}
                <div className="mt-4 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">Risk Score</span>
                    <span className={`font-semibold ${
                      repo.riskScore >= 75 ? "text-severity-critical" :
                      repo.riskScore >= 50 ? "text-severity-high" :
                      repo.riskScore >= 25 ? "text-severity-medium" : "text-agent-success"
                    }`}>
                      {repo.riskScore}/100
                    </span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-muted">
                    <div
                      className={`h-1 rounded-full transition-all ${
                        repo.riskScore >= 75 ? "bg-severity-critical" :
                        repo.riskScore >= 50 ? "bg-severity-high" :
                        repo.riskScore >= 25 ? "bg-severity-medium" : "bg-agent-success"
                      }`}
                      style={{ width: `${repo.riskScore}%` }}
                    />
                  </div>
                </div>

                {/* Stats row */}
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4">
                  <div className="text-center">
                    <p className={`text-lg font-bold ${repoIncidents.length > 0 ? "text-severity-critical" : "text-agent-success"}`}>
                      {repoIncidents.length}
                    </p>
                    <p className="text-[9px] text-muted-foreground">Open</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-lg font-bold ${criticalCount > 0 ? "text-severity-critical" : "text-muted-foreground"}`}>
                      {criticalCount}
                    </p>
                    <p className="text-[9px] text-muted-foreground">Critical</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-lg font-bold ${
                      prediction && prediction.failureProbability > 60 ? "text-severity-high" : "text-agent-success"
                    }`}>
                      {prediction ? `${prediction.failureProbability}%` : "—"}
                    </p>
                    <p className="text-[9px] text-muted-foreground">Fail Prob</p>
                  </div>
                </div>

                {/* Recent incident snippet */}
                {repoIncidents[0] && (
                  <div className="mt-3 flex items-center gap-2 rounded-md bg-muted/30 px-3 py-2">
                    <SeverityBadge severity={repoIncidents[0].severity} />
                    <p className="flex-1 truncate text-[10px] text-muted-foreground">
                      {repoIncidents[0].title}
                    </p>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Analyzed {formatDistanceToNow(repo.lastAnalyzedAt)}</span>
                  <ChevronRight className="h-3.5 w-3.5 group-hover:text-primary transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
