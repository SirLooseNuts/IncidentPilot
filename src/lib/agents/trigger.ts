import { store } from "@/lib/data/store";
import { Incident, AgentRun, RootCause, Recommendation, Patch, Validation, PullRequest } from "@/lib/types";

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

  // Seed Incident Evidence packages
  if (archetype === "memory_leak") {
    store.addEvidence({
      id: `ev_${incidentId}_log`,
      incidentId,
      type: "log",
      content: `[Server] Event trigger notification:change - listeners count: 512\n[Server] Heap snapshot taken (size: 412MB)\n[Server] Process exit: Out of Memory (OOM) error code 137`,
    });
    store.addEvidence({
      id: `ev_${incidentId}_trace`,
      incidentId,
      type: "trace",
      content: `FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory\n at notification-manager.ts:147`,
    });
  } else if (archetype === "db_exhaustion") {
    store.addEvidence({
      id: `ev_${incidentId}_log`,
      incidentId,
      type: "log",
      content: `postgres_1 | WARNING: active database connections: 98 / 100 max_connections\nworker_1 | ConnectionError: Could not retrieve connection from pool in 5000ms`,
    });
  } else if (archetype === "promise_rejection") {
    store.addEvidence({
      id: `ev_${incidentId}_log`,
      incidentId,
      type: "log",
      content: `[API] Stripe verification threw InvalidSignatureError.\n[Runtime] UnhandledPromiseRejection: InvalidSignatureError: No signatures found matching the expected signature.`,
    });
  } else if (archetype === "ml_drift") {
    store.addEvidence({
      id: `ev_${incidentId}_log`,
      incidentId,
      type: "log",
      content: `[Monitor] validation accuracy threshold check failed: 0.78 < 0.82\n[DriftTracker] feature shift detected on scaler normalizer parameters.`,
    });
  }

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

    // Write stage findings to global store to update UI tabs dynamically
    if (i === 2) {
      // Explain stage: Generate root cause analysis
      const rc: RootCause = {
        id: `rc_${incidentId}`,
        incidentId,
        primaryCause: config.title,
        secondaryCauses: archetype === "memory_leak" 
          ? ["EventEmitter listener boundaries retain closures", "V8 memory space leak"]
          : archetype === "db_exhaustion"
          ? ["Heavy weight loading blocks db query executions", "Pool allocation overflow"]
          : archetype === "promise_rejection"
          ? ["Cryptographic verify mismatch throws error code exception", "Unhandled Stripe key rotate"]
          : ["A stale normalization scaler leads to predictions data bias", "Accuracy degradation on validation sets"],
        reasoning: config.agentOutputs[2],
        confidence: 90 + Math.floor(Math.random() * 8),
        affectedServices: [config.repoId.replace("repo_", "")],
      };
      store.addRootCause(rc);
    } else if (i === 3) {
      // Recommend stage: Create recommendation
      const rec: Recommendation = {
        id: `rec_sim_${incidentId}`,
        incidentId,
        type: "immediate",
        title: config.agentOutputs[3],
        description: archetype === "memory_leak"
          ? "Implement structural cleanups inside lifecycle hooks to prevent memory reference leaks."
          : archetype === "db_exhaustion"
          ? "Separate weights load initialization logic to run outside database transaction pool scopes."
          : archetype === "promise_rejection"
          ? "Wrap external constructEvent check calls inside try-catch handler blocks."
          : "Automate StandardScaler model fit operations using a background task runner.",
        confidence: 94,
        effort: "low",
        risk: "low",
        accepted: true,
      };
      store.addRecommendation(rec);
    } else if (i === 4) {
      // Patch stage: Create code diff patch
      const patch: Patch = {
        id: `patch_sim_${incidentId}`,
        incidentId,
        diff: archetype === "memory_leak"
          ? `diff --git a/src/notification-manager.ts b/src/notification-manager.ts\nindex d38f2..4c910 100644\n--- a/src/notification-manager.ts\n+++ b/src/notification-manager.ts\n@@ -143,3 +143,7 @@\n   constructor() {\n     notificationEmitter.on('change', this.handleChange);\n   }\n+\n+  destroy() {\n+    notificationEmitter.off('change', this.handleChange);\n+  }`
          : archetype === "db_exhaustion"
          ? `diff --git a/src/pipeline/evaluation.py b/src/pipeline/evaluation.py\nindex a12e3..b89f2 100644\n--- a/src/pipeline/evaluation.py\n+++ b/src/pipeline/evaluation.py\n@@ -12,4 +12,8 @@\n-def load_model_weights():\n-    with db.transaction():\n-        weights = fetch_weights()\n-        init_ml_model(weights)\n+def load_model_weights():\n+    weights = fetch_weights() # runs outside of transactions\n+    init_ml_model(weights)`
          : archetype === "promise_rejection"
          ? `diff --git a/src/webhook.go b/src/webhook.go\nindex 4c910..d38f2 100644\n--- a/src/webhook.go\n+++ b/src/webhook.go\n@@ -52,5 +52,9 @@\n-  event, err := stripe.ConstructEvent(body, sigHeader, secret)\n+  event, err := stripe.ConstructEvent(body, sigHeader, secret)\n+  if err != nil {\n+      w.WriteHeader(http.StatusBadRequest)\n+      return\n+  }`
          : `diff --git a/src/scaler.py b/src/scaler.py\nindex d89a2..c103e 100644\n--- a/src/scaler.py\n+++ b/src/scaler.py\n@@ -15,2 +15,5 @@\n-def normalize_inputs(df):\n-    return preloaded_scaler.transform(df)\n+def normalize_inputs(df):\n+    if is_scaler_stale():\n+        preloaded_scaler.fit(get_recent_production_data())\n+    return preloaded_scaler.transform(df)`,
        affectedFiles: archetype === "memory_leak"
          ? ["src/notification-manager.ts"]
          : archetype === "db_exhaustion"
          ? ["src/pipeline/evaluation.py"]
          : archetype === "promise_rejection"
          ? ["src/webhook.go"]
          : ["src/scaler.py"],
        explanation: config.agentOutputs[4],
        sideEffects: archetype === "memory_leak"
          ? "No side effects. Memory remains flat post-cleanup."
          : archetype === "db_exhaustion"
          ? "Releases active Postgres slots. Improves overall thread availability."
          : archetype === "promise_rejection"
          ? "Returns Bad Request instead of crashing thread execution."
          : "Slight model overhead during fit updates on initial startup.",
      };
      store.addPatch(patch);
    } else if (i === 5) {
      // Validate stage: Compile validation tests passes
      const val: Validation = {
        id: `val_sim_${incidentId}`,
        patchId: `patch_sim_${incidentId}`,
        incidentId,
        testsPassed: archetype === "memory_leak" ? 12 : archetype === "db_exhaustion" ? 14 : archetype === "promise_rejection" ? 8 : 10,
        testsFailed: 0,
        lintStatus: "passed",
        securityStatus: "passed",
        overallStatus: "passed",
        report: archetype === "memory_leak"
          ? `[Sandbox Container] Running verification suite:\n  ✓ unit_test_cleanup_handling (40ms)\n  ✓ integration_leak_profile (120ms)\nLint checks: PASS\nVulnerability checks: 0 warnings.\nValidation PASS.`
          : archetype === "db_exhaustion"
          ? `[Sandbox Container] Checking database locks under stress test:\n  ✓ connection_pool_stable (200ms)\n  ✓ latency_remains_flat (45ms)\nValidation PASS.`
          : archetype === "promise_rejection"
          ? `[Sandbox Container] Validating webhooks verify handlers:\n  ✓ construct_event_signature_check (15ms)\n  ✓ bad_signature_returns_400 (10ms)\nValidation PASS.`
          : `[Sandbox Container] Running model evaluation check:\n  ✓ accuracy_recovers_to_0.91 (500ms)\n  ✓ feature_scaler_parameters_fitted (80ms)\nValidation PASS.`,
      };
      store.addValidation(val);
    } else if (i === 6) {
      // PR stage: Build GitHub PR
      const pr: PullRequest = {
        id: `pr_sim_${incidentId}`,
        patchId: `patch_sim_${incidentId}`,
        incidentId,
        prNumber: Math.floor(100 + Math.random() * 900),
        prUrl: "https://github.com/SirLooseNuts/IncidentPilot/pulls",
        title: `fix: automated SRE correction patch for ${incidentId}`,
        body: `## Root Cause Analysis\n${config.agentOutputs[2]}\n\n## Resolution Patch\n${config.agentOutputs[4]}\n\n## Validation Report\nAll sandbox verification tests passed successfully.`,
        status: "open",
        createdAt: new Date().toISOString(),
      };
      store.addPullRequest(pr);
    }

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
