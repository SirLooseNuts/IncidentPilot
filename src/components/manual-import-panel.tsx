"use client";

import { useState } from "react";
import { store } from "@/lib/data/store";
import { triggerInvestigation } from "@/lib/agents/trigger";
import { CodeBlock } from "@/components/ui/code-block";
import { toast } from "sonner";
import {
  Clipboard,
  FileCode,
  GitCommit,
  ScrollText,
  Workflow,
  Zap,
  X,
  ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type PasteType = "log" | "trace" | "workflow" | "diff" | "commit";

const PASTE_TYPES: { value: PasteType; label: string; icon: React.ComponentType<{className?: string}>; placeholder: string }[] = [
  {
    value: "log",
    label: "Build Log",
    icon: ScrollText,
    placeholder: `Paste your CI/CD build logs here…

Example:
❌ Build Failed
Error: java.lang.NullPointerException
  at PaymentService.java:182
  at CheckoutHandler.java:94`,
  },
  {
    value: "trace",
    label: "Stack Trace",
    icon: FileCode,
    placeholder: `Paste a stack trace here…

Example:
FATAL ERROR: JavaScript heap out of memory
  at v8::internal::Heap::CollectGarbage [node]
  at notification-manager.ts:147`,
  },
  {
    value: "workflow",
    label: "GitHub Workflow",
    icon: Workflow,
    placeholder: `Paste your GitHub Actions workflow YAML here…

Example:
name: CI/CD Pipeline
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm test`,
  },
  {
    value: "diff",
    label: "Code Diff",
    icon: GitCommit,
    placeholder: `Paste a git diff here…

Example:
diff --git a/src/service.ts b/src/service.ts
-  listener.on('change', handler)
+  listener.on('change', handler)
+  // TODO: add cleanup`,
  },
  {
    value: "commit",
    label: "Commit / PR",
    icon: GitCommit,
    placeholder: `Paste a commit message, PR description, or change summary…

Example:
feat: Add multi-threading support to evaluation pipeline

This commit introduces a thread pool to parallelize ML model evaluation.
Closes #142`,
  },
];

export function ManualImportPanel() {
  const [pasteType, setPasteType] = useState<PasteType>("log");
  const [content, setContent] = useState("");
  const [repoId, setRepoId] = useState("repo_user_api");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const router = useRouter();

  const repos = store.getRepositories();
  const selectedType = PASTE_TYPES.find((p) => p.value === pasteType)!;

  const handleAnalyze = async () => {
    if (!content.trim()) {
      toast.error("No content to analyze", { description: "Please paste some content first." });
      return;
    }

    setIsAnalyzing(true);
    toast.loading("Analyzing pasted content…");

    // Add evidence to store for next incident
    const evidenceId = `ev_manual_${Date.now()}`;
    store.addEvidence({
      id: evidenceId,
      incidentId: "pending",
      type: pasteType === "trace" ? "trace" : pasteType === "workflow" ? "workflow" : "log",
      content,
    });

    // Trigger investigation
    const incidentId = await triggerInvestigation();

    // Associate evidence with new incident
    store.addEvidence({
      id: `${evidenceId}_linked`,
      incidentId,
      type: pasteType === "trace" ? "trace" : pasteType === "workflow" ? "workflow" : "log",
      content,
    });

    toast.dismiss();
    toast.success("Investigation started!", {
      description: `Incident ${incidentId} created. Redirecting to analysis…`,
    });

    setIsAnalyzing(false);
    setContent("");

    setTimeout(() => {
      router.push(`/incidents/${incidentId}`);
    }, 1500);
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Clipboard className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-semibold">Manual Import</h2>
          <p className="text-xs text-muted-foreground">
            Paste logs, stack traces, workflows, or commits to trigger AI analysis
          </p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Type + Repo selectors */}
        <div className="flex flex-wrap gap-3">
          {/* Content type */}
          <div className="flex-1 min-w-40">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Content Type
            </label>
            <div className="relative">
              <select
                value={pasteType}
                onChange={(e) => setPasteType(e.target.value as PasteType)}
                className="w-full appearance-none rounded-md border border-input bg-background py-2 pl-3 pr-8 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {PASTE_TYPES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          {/* Repository */}
          <div className="flex-1 min-w-40">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Repository
            </label>
            <div className="relative">
              <select
                value={repoId}
                onChange={(e) => setRepoId(e.target.value)}
                className="w-full appearance-none rounded-md border border-input bg-background py-2 pl-3 pr-8 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {repos.map((r) => (
                  <option key={r.id} value={r.id}>{r.fullName}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Type pills */}
        <div className="flex flex-wrap gap-1.5">
          {PASTE_TYPES.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.value}
                onClick={() => setPasteType(p.value)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  pasteType === p.value
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border bg-muted/30 text-muted-foreground hover:border-accent hover:bg-accent/50 hover:text-accent-foreground"
                )}
              >
                <Icon className="h-3 w-3" />
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Textarea */}
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={selectedType.placeholder}
            rows={12}
            className="w-full resize-y rounded-lg border border-input bg-[oklch(0.07_0.01_250)] px-4 py-3 font-mono text-xs leading-relaxed text-foreground/90 placeholder:font-sans placeholder:text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {content && (
            <button
              onClick={() => setContent("")}
              className="absolute right-3 top-3 rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Preview if content */}
        {content && (
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Preview:</p>
            <CodeBlock
              code={content}
              language={pasteType === "workflow" ? "yaml" : pasteType === "diff" ? "diff" : "log"}
              maxHeight="200px"
              showLineNumbers={false}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            {content.trim()
              ? `${content.split("\n").length} lines · ${content.length} chars`
              : "Paste content above to enable analysis"}
          </p>
          <button
            onClick={handleAnalyze}
            disabled={!content.trim() || isAnalyzing}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Zap className="h-4 w-4 animate-pulse" />
                Analyzing…
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Analyze with AI
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
