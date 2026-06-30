import { store } from "@/lib/data/store";
import { Incident, AgentRun } from "@/lib/types";

const ARCHETYPES = ["memory_leak", "db_exhaustion", "promise_rejection", "ml_drift"] as const;
type Archetype = typeof ARCHETYPES[number];

const archetypeOutputs: Record<Archetype, {
  title: string;
  repoId: string;
  severity: Incident["severity"];
  agentOutputs: string[];
}> = {
  memory_leak: {
    title: "Memory leak detected in service event handlers",
    repoId: "repo_user_api",
    severity: "critical",
    agentOutputs: [
      "Memory growth rate 18MB/min detected. OOM predicted in 15 minutes.",
      "Traced to commit introducing notification EventEmitter bindings without cleanup.",
      "Root cause: listener closures not removed on view destruction.",
      "Recommended: Add destroy() method with emitter.off() call.",
      "Generated patch using DeepSpec DSpark draft model (3.2x inference speedup).",
      "12/12 tests passed. Heap flat after 1000 iterations.",
      "PR #143 created: fix: cleanup notification listeners on destroy.",
      "Pattern added to knowledge base: Node.js event listener memory leak.",
      "Risk score updated: 71% (down from 78%).",
    ],
  },
  db_exhaustion: {
    title: "Database connection pool exhaustion in worker threads",
    repoId: "repo_ml_pipeline",
    severity: "high",
    agentOutputs: [
      "DB pool at 100% capacity. Backend latency +850ms.",
      "80 idle-in-transaction queries found in pg_stat_activity.",
      "Root cause: ML model weights loaded inside db transaction scope.",
      "Recommended: Use context manager to return connections before model load.",
      "Generated patch using DeepSpec DSpark draft model (3.0x inference speedup).",
      "Latency normalized to 22ms under load test.",
      "PR #87 created: fix: release db connections before model initialization.",
      "Architecture pattern added: connection lifecycle management.",
      "Failure probability updated: 32% (down from 45%).",
    ],
  },
  promise_rejection: {
    title: "Unhandled promise rejection in webhook handler",
    repoId: "repo_payments_go",
    severity: "medium",
    agentOutputs: [
      "UnhandledPromiseRejection detected in /webhook/stripe route.",
      "InvalidSignatureError from Stripe API matched to stale signing secret.",
      "Root cause: Webhook secret not rotated after Stripe key refresh.",
      "Recommended: Wrap stripe.constructEvent in try/catch with fallback logging.",
      "Generated patch using DeepSpec DFlash draft model (2.9x inference speedup).",
      "All 8 webhook integration tests passing.",
      "PR #56 created: fix: catch Stripe signature errors in webhook handler.",
      "Runbook entry added: Webhook signature validation failures.",
      "Risk score updated: 18% (down from 32%).",
    ],
  },
  ml_drift: {
    title: "ML model drift detected — accuracy below threshold",
    repoId: "repo_ml_pipeline",
    severity: "high",
    agentOutputs: [
      "Model accuracy 0.78 — below 0.82 threshold. Drift rate 3.2% over 7 days.",
      "Feature distribution shift detected in user_age normalization input.",
      "Root cause: Production data distribution changed, scaler artifact is 90 days stale.",
      "Recommended: Retrain scaler on last 30 days of production data.",
      "Generated patch using DeepSpec Eagle3 draft model (3.1x inference speedup).",
      "Accuracy restored to 0.91 on held-out validation set.",
      "PR #91 created: fix: refresh feature scaler for current data distribution.",
      "Model drift pattern documented in knowledge base.",
      "Prediction confidence updated: 89% (up from 74%).",
    ],
  },
};

const AGENT_TYPES: AgentRun["agentType"][] = [
  "monitoring", "context", "root_cause", "recommendation",
  "patch", "validation", "pr", "learning", "prediction",
];

const AGENT_NAMES = [
  "Monitoring Agent", "Context Agent", "Root Cause Agent", "Recommendation Agent",
  "Patch Agent", "Validation Agent", "PR Agent", "Learning Agent", "Prediction Agent",
];

export async function triggerInvestigation(): Promise<string> {
  const archetype = ARCHETYPES[Math.floor(Math.random() * ARCHETYPES.length)];
  const config = archetypeOutputs[archetype];

  // Create new incident
  const incidentId = `INC-${String(Date.now()).slice(-4)}`;
  const now = new Date().toISOString();

  const newIncident: Incident = {
    id: incidentId,
    repoId: config.repoId,
    orgId: "org_acme",
    title: config.title,
    severity: config.severity,
    status: "detected",
    commitSha: Math.random().toString(16).slice(2, 10),
    commitMessage: "feat: new changes",
    author: "auto-detected",
    branch: "main",
    pipelineStage: 1,
    createdAt: now,
  };

  store.addIncident(newIncident);

  // Simulate agent pipeline advancing with delays
  simulatePipeline(incidentId, archetype);

  return incidentId;
}

async function simulatePipeline(incidentId: string, archetype: Archetype) {
  const config = archetypeOutputs[archetype];

  for (let i = 0; i < 9; i++) {
    // Delay between stages (1-2.5s)
    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1500));

    const runId = `run_sim_${incidentId}_${i}`;
    const startedAt = new Date().toISOString();

    // Mark as running
    const runningRun: AgentRun = {
      id: runId,
      incidentId,
      agentName: AGENT_NAMES[i],
      agentType: AGENT_TYPES[i],
      status: "running",
      inputSummary: `Processing stage ${i + 1}…`,
      outputSummary: "",
      confidence: 0,
      durationMs: 0,
      startedAt,
    };
    store.addAgentRun(runningRun);

    // Update incident pipeline stage
    store.updateIncident(incidentId, {
      pipelineStage: i + 1,
      status: i === 8 ? "resolved" : i >= 6 ? "pr_created" : i >= 5 ? "validated" : i >= 4 ? "patched" : i >= 2 ? "root_caused" : "investigating",
    });

    // Wait for "processing"
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 1000));

    const completedAt = new Date().toISOString();
    const durationMs = new Date(completedAt).getTime() - new Date(startedAt).getTime();
    const confidence = 80 + Math.floor(Math.random() * 18);

    // Mark as success
    store.updateAgentRun(runId, {
      status: "success",
      outputSummary: config.agentOutputs[i],
      confidence,
      durationMs,
      completedAt,
    });
  }
}
