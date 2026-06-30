"use client";

import { useState } from "react";
import { store } from "@/lib/data/store";
import { KnowledgeEntry } from "@/lib/types";
import { Bot, Send, BookOpen, Sparkles, AlertCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SourceCitation {
  id: string;
  title: string;
  category: string;
}

const SAMPLE_QUESTIONS = [
  "How do we handle memory leaks in V8 / Node.js?",
  "What is our consistency strategy during database partitions?",
  "How should Stripe webhooks handle validation failures?",
  "What is the mitigation for CUDA GPU Out-Of-Memory errors?",
];

export function KnowledgeBaseRag() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [sources, setSources] = useState<SourceCitation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAsk = async (questionText: string) => {
    if (!questionText.trim()) return;

    setIsGenerating(true);
    setResponse("");
    setSources([]);

    // Get all entries from store
    const allEntries = store.getKnowledgeEntries();

    // 1. Retrieval Phase: keyword & text matching
    const searchTerms = questionText.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const matchedEntries = allEntries.map(entry => {
      let score = 0;
      const textToSearch = `${entry.title} ${entry.content} ${entry.tags.join(" ")}`.toLowerCase();
      searchTerms.forEach(term => {
        if (textToSearch.includes(term)) score += 1;
      });
      return { entry, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

    // 2. Synthesis (Generation) Phase
    // Simulate thinking delay (1.2s - 2s)
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

    // Determine synthetic response based on matched keys
    let answer = "I scanned the knowledge base but could not find a specific pattern matching your query. Try searching for terms like 'memory leak', 'CAP', 'Stripe', or 'GPU'.";
    
    const lowercaseQuestion = questionText.toLowerCase();
    if (lowercaseQuestion.includes("memory") || lowercaseQuestion.includes("leak") || lowercaseQuestion.includes("v8")) {
      answer = "According to Acme Corp's architectural patterns (documented in Level 4 & DDIA standards), Node.js/V8 memory leaks frequently stem from global EventEmitters keeping references to view closures in scope. In user-api (resolved in INC-001), the fix is to explicitly invoke `emitter.off()` inside cleanup/destroy hooks, preventing garbage collection retention. Alternatively, implement WeakRef registries for dynamic views.";
    } else if (lowercaseQuestion.includes("cap") || lowercaseQuestion.includes("consistency") || lowercaseQuestion.includes("partition")) {
      answer = "For payments-go (as per CS Level 8 rules & Designing Data-Intensive Applications principles), our distributed partition policy prioritizes Consistency (CP) over Availability. In the event of network splits, writes to database master nodes are strictly rejected, preventing split-brain database sync conflicts or double-billing failures.";
    } else if (lowercaseQuestion.includes("stripe") || lowercaseQuestion.includes("webhook") || lowercaseQuestion.includes("signature")) {
      answer = "SaaS webhook endpoint handlers (CS Level 15) must wrap cryptographic signature verification inside try-catch structures. Since validation errors throw exceptions (like `InvalidSignatureError` during Stripe signature rotates), unhandled rejects will crash backend workers. Always catch verification errors, log details locally, and return HTTP 400 Bad Request instead.";
    } else if (lowercaseQuestion.includes("cuda") || lowercaseQuestion.includes("gpu") || lowercaseQuestion.includes("oom") || lowercaseQuestion.includes("transformer")) {
      answer = "Transformer context scaling OOM (Level 12) is caused by the quadratic memory footprint growth of raw self-attention. Mitigation patterns: 1) Deploy FlashAttention v2 to optimize memory access bottlenecks; 2) Utilize gradient accumulation batching; 3) Scale model parameters selectively with LoRA adapters.";
    } else if (lowercaseQuestion.includes("jwt") || lowercaseQuestion.includes("auth") || lowercaseQuestion.includes("security") || lowercaseQuestion.includes("csrf")) {
      answer = "To mitigate OWASP Top 10 vulnerabilities (Level 9), session tokens should not be stored in localStorage. Use HTTPOnly, SameSite=Lax secure cookies. Add double-submit token checking for write API endpoints, and enforce rate-limiting via Redis token buckets to deter credential stuffing attacks.";
    } else if (lowercaseQuestion.includes("raft") || lowercaseQuestion.includes("consensus")) {
      answer = "Split-brain consensus election risks in Raft clusters (Level 8) are resolved by enforcing joint consensus membership configuration changes. Enforce term increment validations and check alive heartbeats before promoting dynamic backup nodes.";
    }

    setResponse(answer);
    setSources(matchedEntries.map(item => ({
      id: item.entry.id,
      title: item.entry.title,
      category: item.entry.category
    })));
    setIsGenerating(false);
  };

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Bot className="h-4 w-4" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-semibold text-foreground">AI SRE RAG Assistant</h3>
            <span className="inline-flex items-center gap-0.5 rounded bg-primary/10 px-1 py-0.5 text-[8px] font-bold uppercase tracking-wider text-primary">
              <Sparkles className="h-2 w-2" />
              RAG Active
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Search, retrieve, and synthesize incident insights using retrieval-augmented generation
          </p>
        </div>
      </div>

      {/* Suggested Questions */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Suggested Questions:</p>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => {
                setQuery(q);
                handleAsk(q);
              }}
              className="rounded-md border border-border bg-background/50 px-2 py-1 text-[10px] text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-colors text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Query Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAsk(query)}
          placeholder="Ask a question about codebase failures, patterns, or architecture lessons..."
          className="w-full rounded-md border border-input bg-background/60 py-2.5 pl-3.5 pr-10 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          onClick={() => handleAsk(query)}
          disabled={!query.trim() || isGenerating}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
        >
          {isGenerating ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Answer Output */}
      {isGenerating && (
        <div className="rounded-lg border border-border bg-background/50 p-4 space-y-2 animate-pulse">
          <div className="h-2 bg-muted rounded w-1/4" />
          <div className="h-2 bg-muted rounded w-full" />
          <div className="h-2 bg-muted rounded w-5/6" />
        </div>
      )}

      {response && !isGenerating && (
        <div className="rounded-lg border border-border bg-background/40 p-4 space-y-3">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Synthesized AI Response</span>
          </div>
          <p className="text-xs leading-relaxed text-foreground/95 whitespace-pre-wrap">{response}</p>

          {/* Citations / Sources */}
          {sources.length > 0 && (
            <div className="border-t border-border/60 pt-3">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Retrieved Context Sources ({sources.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {sources.map((src) => (
                  <div
                    key={src.id}
                    className="inline-flex items-center gap-1 rounded border border-border bg-background/60 px-2 py-0.5 text-[9px] font-medium"
                  >
                    <BookOpen className="h-2.5 w-2.5 text-primary" />
                    <span className="text-muted-foreground capitalize">{src.category}:</span>
                    <span className="text-foreground truncate max-w-40 font-semibold">{src.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
