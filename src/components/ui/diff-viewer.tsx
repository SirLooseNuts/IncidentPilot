"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Copy, Check, FileCode } from "lucide-react";

interface DiffViewerProps {
  diff: string;
  affectedFiles?: string[];
  className?: string;
}

export function DiffViewer({ diff, affectedFiles, className }: DiffViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(diff);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = diff.split("\n");

  const getLineStyle = (line: string) => {
    if (line.startsWith("+++") || line.startsWith("---")) {
      return "text-muted-foreground bg-transparent";
    }
    if (line.startsWith("+")) {
      return "bg-agent-success/10 text-agent-success";
    }
    if (line.startsWith("-")) {
      return "bg-severity-critical/10 text-severity-critical";
    }
    if (line.startsWith("@@")) {
      return "text-agent-running bg-agent-running/5";
    }
    if (line.startsWith("diff") || line.startsWith("index")) {
      return "text-muted-foreground/60";
    }
    return "text-foreground/80";
  };

  return (
    <div className={cn("overflow-hidden rounded-lg border border-border bg-[oklch(0.07_0.01_250)]", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          <FileCode className="h-3.5 w-3.5 text-muted-foreground" />
          {affectedFiles && affectedFiles.length > 0 && (
            <div className="flex gap-2">
              {affectedFiles.map((f) => (
                <span
                  key={f}
                  className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                >
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-agent-success" />
              <span className="text-agent-success">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy patch</span>
            </>
          )}
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-3 border-b border-border px-4 py-1.5">
        <span className="text-[10px] text-agent-success">
          +{lines.filter((l) => l.startsWith("+") && !l.startsWith("+++")).length} additions
        </span>
        <span className="text-[10px] text-severity-critical">
          -{lines.filter((l) => l.startsWith("-") && !l.startsWith("---")).length} deletions
        </span>
      </div>

      {/* Diff lines */}
      <div className="overflow-auto" style={{ maxHeight: "500px" }}>
        <pre className="p-0 text-xs leading-6">
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((line, i) => (
                <tr key={i} className={cn("group", getLineStyle(line))}>
                  <td className="w-10 select-none border-r border-border/30 pr-3 text-right font-mono text-muted-foreground/40 pl-2 group-hover:text-muted-foreground/60">
                    {i + 1}
                  </td>
                  <td className="pl-4 pr-4">
                    <code className="font-mono">{line || " "}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </pre>
      </div>
    </div>
  );
}
