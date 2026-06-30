"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Copy, Check } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
  className?: string;
}

export function CodeBlock({ code, language, showLineNumbers = true, maxHeight = "400px", className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split("\n");

  return (
    <div className={cn("relative rounded-lg border border-border bg-[oklch(0.07_0.01_250)] overflow-hidden", className)}>
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {language || "text"}
        </span>
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
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <div className="overflow-auto" style={{ maxHeight }}>
        <pre className="p-4 text-xs leading-6">
          {showLineNumbers ? (
            <table className="w-full border-collapse">
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i} className="group">
                    <td className="w-10 select-none pr-4 text-right font-mono text-muted-foreground/40 group-hover:text-muted-foreground/70">
                      {i + 1}
                    </td>
                    <td className="font-mono text-foreground/90">
                      <code>{line || " "}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <code className="font-mono text-foreground/90">{code}</code>
          )}
        </pre>
      </div>
    </div>
  );
}
