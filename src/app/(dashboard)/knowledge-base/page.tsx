"use client";

import { useState } from "react";
import { useKnowledgeBase } from "@/hooks/useKnowledgeBase";
import { EmptyState } from "@/components/ui/empty-state";
import { KnowledgeBaseRag } from "@/components/knowledge-base-rag";
import { Search, BookOpen, Lightbulb, Wrench, Building2, Star } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";
import Link from "next/link";

const CATEGORIES = ["All", "Patterns", "Fixes", "Architecture", "Recommendations"];

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  pattern: BookOpen,
  fix: Wrench,
  architecture: Building2,
  recommendation: Lightbulb,
};

const CATEGORY_COLORS: Record<string, string> = {
  pattern: "border-agent-running/30 bg-agent-running/10 text-agent-running",
  fix: "border-agent-success/30 bg-agent-success/10 text-agent-success",
  architecture: "border-primary/30 bg-primary/10 text-primary",
  recommendation: "border-severity-medium/30 bg-severity-medium/10 text-severity-medium",
};

export default function KnowledgeBasePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const { entries, loading } = useKnowledgeBase(search, category);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
        <p className="text-sm text-muted-foreground">
          Patterns, fixes, and architectural insights learned from every incident
        </p>
      </div>

      {/* RAG SRE Chat Assistant */}
      <KnowledgeBaseRag />

      {/* Search + Filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search patterns, fixes, tags…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex gap-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                category === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <p className="text-xs text-muted-foreground">
        {loading ? "Loading…" : `${entries.length} entr${entries.length !== 1 ? "ies" : "y"} found`}
      </p>

      {/* Entries */}
      {entries.length === 0 && !loading ? (
        <EmptyState
          icon={BookOpen}
          heading="No knowledge entries found"
          description="No entries match your search. Try different keywords or clear the filters."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {entries.map((entry) => {
            const Icon = CATEGORY_ICONS[entry.category] || BookOpen;
            const colorClass = CATEGORY_COLORS[entry.category] || "border-border bg-muted/20 text-muted-foreground";

            return (
              <div
                key={entry.id}
                className="group rounded-lg border border-border bg-card p-5 transition-all hover:border-primary/20 hover:shadow-md hover:shadow-primary/5"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg border ${colorClass}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${colorClass}`}>
                      {entry.category}
                    </span>
                  </div>
                  {entry.incidentId && (
                    <Link
                      href={`/incidents/${entry.incidentId}`}
                      className="flex items-center gap-1 text-[10px] font-mono text-primary hover:underline"
                    >
                      <Star className="h-3 w-3" />
                      {entry.incidentId}
                    </Link>
                  )}
                </div>

                <h3 className="text-sm font-semibold mb-2 group-hover:text-primary transition-colors">
                  {entry.title}
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground line-clamp-3">
                  {entry.content}
                </p>

                {/* Tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border bg-muted/50 px-2 py-0.5 font-mono text-[9px] text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <p className="mt-3 text-[10px] text-muted-foreground/60">
                  Added {formatDistanceToNow(entry.createdAt)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
