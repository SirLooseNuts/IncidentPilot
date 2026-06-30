import type { Metadata } from "next";
import { ManualImportPanel } from "@/components/manual-import-panel";

export const metadata: Metadata = {
  title: "Analyze — IncidentPilot AI",
  description: "Manually paste logs, stack traces, workflows, or commits to trigger AI root cause analysis.",
};

export default function AnalyzePage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analyze</h1>
        <p className="text-sm text-muted-foreground">
          Paste any build log, stack trace, GitHub workflow, or commit to start an autonomous investigation
        </p>
      </div>
      <ManualImportPanel />
    </div>
  );
}
