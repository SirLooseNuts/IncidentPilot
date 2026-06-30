import {
  Organization,
  Repository,
  Incident,
  AgentRun,
  Evidence,
  RootCause,
  Recommendation,
  Patch,
  Validation,
  PullRequest,
  Prediction,
  KnowledgeEntry,
} from "../types";

export const mockOrg: Organization = {
  id: "org_acme",
  name: "Acme Corp",
  slug: "acme-corp",
  plan: "Pro",
  createdAt: "2025-01-01T00:00:00Z",
};

export const mockRepositories: Repository[] = [
  {
    id: "repo_user_api",
    orgId: "org_acme",
    name: "user-api",
    fullName: "acme-corp/user-api",
    provider: "github",
    defaultBranch: "main",
    primaryLanguage: "TypeScript",
    servicesCount: 12,
    riskScore: 78,
    status: "active",
    lastAnalyzedAt: "2026-06-29T23:00:00Z",
    createdAt: "2025-02-15T00:00:00Z",
  },
  {
    id: "repo_ml_pipeline",
    orgId: "org_acme",
    name: "ml-pipeline",
    fullName: "acme-corp/ml-pipeline",
    provider: "github",
    defaultBranch: "main",
    primaryLanguage: "Python",
    servicesCount: 5,
    riskScore: 45,
    status: "active",
    lastAnalyzedAt: "2026-06-29T22:30:00Z",
    createdAt: "2025-05-10T00:00:00Z",
  },
  {
    id: "repo_payments_go",
    orgId: "org_acme",
    name: "payments-go",
    fullName: "acme-corp/payments-go",
    provider: "github",
    defaultBranch: "main",
    primaryLanguage: "Go",
    servicesCount: 8,
    riskScore: 22,
    status: "idle",
    lastAnalyzedAt: "2026-06-29T18:15:00Z",
    createdAt: "2025-09-01T00:00:00Z",
  },
];

export const mockIncidents: Incident[] = [
  {
    id: "INC-001",
    repoId: "repo_user_api",
    orgId: "org_acme",
    title: "Memory leak in user-api event handlers",
    severity: "critical",
    status: "pr_created",
    commitSha: "8a4d2f19",
    commitMessage: "feat: Add event dispatch system for notification settings",
    author: "sarah.chen",
    branch: "feat/notifications",
    pipelineStage: 7,
    createdAt: "2026-06-29T23:30:00Z",
  },
  {
    id: "INC-002",
    repoId: "repo_ml_pipeline",
    orgId: "org_acme",
    title: "Database connection pool exhaustion in worker pool",
    severity: "high",
    status: "validated",
    commitSha: "4c9b1e22",
    commitMessage: "fix: Add multi-threading support to evaluation pipeline",
    author: "alex.kumar",
    branch: "main",
    pipelineStage: 6,
    createdAt: "2026-06-29T23:10:00Z",
  },
  {
    id: "INC-003",
    repoId: "repo_payments_go",
    orgId: "org_acme",
    title: "Unhandled promise rejection in Stripe webhook handler",
    severity: "medium",
    status: "root_caused",
    commitSha: "1f3e5c9b",
    commitMessage: "refactor: Upgrade Stripe SDK and enhance checkout logic",
    author: "mike.johnson",
    branch: "main",
    pipelineStage: 3,
    createdAt: "2026-06-29T22:45:00Z",
  },
  {
    id: "INC-004",
    repoId: "repo_ml_pipeline",
    orgId: "org_acme",
    title: "ML Model Drift: accuracy score fell below 0.82 threshold",
    severity: "high",
    status: "resolved",
    commitSha: "9a2f4e8b",
    commitMessage: "deploy: Release v2.4 recommendation weights model",
    author: "lisa.wang",
    branch: "main",
    pipelineStage: 9,
    createdAt: "2026-06-29T15:20:00Z",
    resolvedAt: "2026-06-29T15:45:00Z",
  },
  {
    id: "INC-005",
    repoId: "repo_user_api",
    orgId: "org_acme",
    title: "Rate limiter bypass in auth module API keys",
    severity: "critical",
    status: "investigating",
    commitSha: "d5a8b7f1",
    commitMessage: "feat: Add scope support to developer API keys",
    author: "raj.patel",
    branch: "feat/api-scopes",
    pipelineStage: 2,
    createdAt: "2026-06-29T23:42:00Z",
  },
];

export const mockAgentRuns: AgentRun[] = [
  // INC-001 runs
  {
    id: "run_001_1",
    incidentId: "INC-001",
    agentName: "Monitoring Agent",
    agentType: "monitoring",
    status: "success",
    inputSummary: "Continuous runtime stats checking for service user-api",
    outputSummary: "Memory growth rate exceeds 15MB/min. Out-Of-Memory container termination predicted within 20 minutes.",
    confidence: 99,
    durationMs: 420,
    startedAt: "2026-06-29T23:30:05Z",
    completedAt: "2026-06-29T23:30:06Z",
  },
  {
    id: "run_001_2",
    incidentId: "INC-001",
    agentName: "Context Agent",
    agentType: "context",
    status: "success",
    inputSummary: "Search logs & commits from repo_user_api corresponding to memory rise timeline",
    outputSummary: "Identified commit 8a4d2f19 adding listener notification.emitter.on('change', handler). Checked heapdump logs.",
    confidence: 95,
    durationMs: 820,
    startedAt: "2026-06-29T23:30:10Z",
    completedAt: "2026-06-29T23:30:11Z",
  },
  {
    id: "run_001_3",
    incidentId: "INC-001",
    agentName: "Root Cause Agent",
    agentType: "root_cause",
    status: "success",
    inputSummary: "Analyze node heap snapshots and diff changes in notification manager",
    outputSummary: "Notification settings emitter adds listener on 'change' but never removes it when settings views destroy, creating memory leak leaks in context closure.",
    confidence: 92,
    durationMs: 1450,
    startedAt: "2026-06-29T23:30:15Z",
    completedAt: "2026-06-29T23:30:17Z",
  },
  {
    id: "run_001_4",
    incidentId: "INC-001",
    agentName: "Recommendation Agent",
    agentType: "recommendation",
    status: "success",
    inputSummary: "Provide fixes for event emitter leakage in Node.js",
    outputSummary: "Recommended immediate fix: add clean-up logic on settings manager destruction. Recommended safer fix: use WeakRef if lifecycles cannot be easily managed.",
    confidence: 89,
    durationMs: 1100,
    startedAt: "2026-06-29T23:30:20Z",
    completedAt: "2026-06-29T23:30:21Z",
  },
  {
    id: "run_001_5",
    incidentId: "INC-001",
    agentName: "Patch Agent",
    agentType: "patch",
    status: "success",
    inputSummary: "Generate git diff for notifications.ts cleanup code",
    outputSummary: "Generated patch introducing unsubscribe hook removing notifier change listener upon service destroy.",
    confidence: 87,
    durationMs: 2100,
    startedAt: "2026-06-29T23:30:25Z",
    completedAt: "2026-06-29T23:30:27Z",
  },
  {
    id: "run_001_6",
    incidentId: "INC-001",
    agentName: "Validation Agent",
    agentType: "validation",
    status: "success",
    inputSummary: "Verify patch code against test cases in container sandbox",
    outputSummary: "All 12 notification integration tests passed. ESLint is clean. No leak detected after 1000 simulated iterations.",
    confidence: 96,
    durationMs: 3400,
    startedAt: "2026-06-29T23:30:30Z",
    completedAt: "2026-06-29T23:30:33Z",
  },
  {
    id: "run_001_7",
    incidentId: "INC-001",
    agentName: "PR Agent",
    agentType: "pr",
    status: "success",
    inputSummary: "Create Pull Request and description on GitHub",
    outputSummary: "Created PR #142 'fix: Fix memory leak in notification settings emitter change listeners'. Automated test results appended.",
    confidence: 99,
    durationMs: 1200,
    startedAt: "2026-06-29T23:30:35Z",
    completedAt: "2026-06-29T23:30:36Z",
  },

  // INC-002 runs
  {
    id: "run_002_1",
    incidentId: "INC-002",
    agentName: "Monitoring Agent",
    agentType: "monitoring",
    status: "success",
    inputSummary: "Continuous db connections count checking",
    outputSummary: "Database pool utilization hit 100% capacity. Backend latency spiked by 800ms.",
    confidence: 98,
    durationMs: 400,
    startedAt: "2026-06-29T23:10:05Z",
    completedAt: "2026-06-29T23:10:05Z",
  },
  {
    id: "run_002_2",
    incidentId: "INC-002",
    agentName: "Context Agent",
    agentType: "context",
    status: "success",
    inputSummary: "Find active query logs in postgres",
    outputSummary: "Discovered 80 idle in transaction queries generated by evaluating service handler. Traced back to thread pool code.",
    confidence: 94,
    durationMs: 900,
    startedAt: "2026-06-29T23:10:10Z",
    completedAt: "2026-06-29T23:10:11Z",
  },
  {
    id: "run_002_3",
    incidentId: "INC-002",
    agentName: "Root Cause Agent",
    agentType: "root_cause",
    status: "success",
    inputSummary: "Trace thread execution context and db driver handles",
    outputSummary: "Thread evaluation task holds database connections open throughout model load instead of returning them to the pool before computing predictions.",
    confidence: 96,
    durationMs: 1500,
    startedAt: "2026-06-29T23:10:15Z",
    completedAt: "2026-06-29T23:10:17Z",
  },
  {
    id: "run_002_4",
    incidentId: "INC-002",
    agentName: "Recommendation Agent",
    agentType: "recommendation",
    status: "success",
    inputSummary: "Design pool preservation options",
    outputSummary: "Recommends wrapping evaluations in context manager that eagerly closes or returns connections, or extending maximum pool configuration.",
    confidence: 91,
    durationMs: 1100,
    startedAt: "2026-06-29T23:10:20Z",
    completedAt: "2026-06-29T23:10:21Z",
  },
  {
    id: "run_002_5",
    incidentId: "INC-002",
    agentName: "Patch Agent",
    agentType: "patch",
    status: "success",
    inputSummary: "Write fix patch file",
    outputSummary: "Created python diff surrounding worker task call with connection yield and close logic.",
    confidence: 88,
    durationMs: 1900,
    startedAt: "2026-06-29T23:10:25Z",
    completedAt: "2026-06-29T23:10:27Z",
  },
  {
    id: "run_002_6",
    incidentId: "INC-002",
    agentName: "Validation Agent",
    agentType: "validation",
    status: "success",
    inputSummary: "Run database latency checks inside sandbox",
    outputSummary: "DB connection pool remains stable under high load simulation. Latency stable at 24ms.",
    confidence: 95,
    durationMs: 3100,
    startedAt: "2026-06-29T23:10:30Z",
    completedAt: "2026-06-29T23:10:33Z",
  },

  // INC-003 runs
  {
    id: "run_003_1",
    incidentId: "INC-003",
    agentName: "Monitoring Agent",
    agentType: "monitoring",
    status: "success",
    inputSummary: "Parse application error logging files",
    outputSummary: "500 Internal Server Error returned by Stripe Webhook. Diagnostic code shows UnhandledPromiseRejection.",
    confidence: 97,
    durationMs: 380,
    startedAt: "2026-06-29T22:45:05Z",
    completedAt: "2026-06-29T22:45:05Z",
  },
  {
    id: "run_003_2",
    incidentId: "INC-003",
    agentName: "Context Agent",
    agentType: "context",
    status: "success",
    inputSummary: "Scan Stripe API references and repository files",
    outputSummary: "Identified call to `stripe.paymentIntents.retrieve` without an error catch block, matching stack trace line 147.",
    confidence: 96,
    durationMs: 880,
    startedAt: "2026-06-29T22:45:10Z",
    completedAt: "2026-06-29T22:45:11Z",
  },
  {
    id: "run_003_3",
    incidentId: "INC-003",
    agentName: "Root Cause Agent",
    agentType: "root_cause",
    status: "success",
    inputSummary: "Analyze Stripe API error response logs",
    outputSummary: "Stripe API threw an InvalidSignature error during request parsing because of a stale webhook signing secret key. The handler failed to catch this, resulting in an unhandled promise rejection crash.",
    confidence: 93,
    durationMs: 1400,
    startedAt: "2026-06-29T22:45:15Z",
    completedAt: "2026-06-29T22:45:16Z",
  },

  // INC-005 runs
  {
    id: "run_005_1",
    incidentId: "INC-005",
    agentName: "Monitoring Agent",
    agentType: "monitoring",
    status: "success",
    inputSummary: "Security & limits checking logs",
    outputSummary: "Security Alert: API key 'sc-88fd3' exceeded standard rate limits but was not blocked. API response codes are 200 OK instead of 429 Too Many Requests.",
    confidence: 99,
    durationMs: 440,
    startedAt: "2026-06-29T23:42:05Z",
    completedAt: "2026-06-29T23:42:05Z",
  },
  {
    id: "run_005_2",
    incidentId: "INC-005",
    agentName: "Context Agent",
    agentType: "context",
    status: "running",
    inputSummary: "Trace API key rate limit middleware execution path",
    outputSummary: "Tracing call stacks in rate-limit middleware against recent API scopes changes. Tracing git history for `src/middleware/rateLimit.ts`...",
    confidence: 85,
    durationMs: 2500,
    startedAt: "2026-06-29T23:42:10Z",
  },
];

export const mockEvidence: Evidence[] = [
  {
    id: "ev_001_log",
    incidentId: "INC-001",
    type: "log",
    content: `[Server] user-api listening on port 3000
[Server] Heap snapshot taken (size: 42MB)
[Server] Event trigger notification:change - listeners count: 12
[Server] Event trigger notification:change - listeners count: 48
[Server] Event trigger notification:change - listeners count: 182
[Server] Event trigger notification:change - listeners count: 512
[Server] Heap snapshot taken (size: 412MB)
[Server] Process exit: Out of Memory (OOM) error code 137`,
  },
  {
    id: "ev_001_trace",
    incidentId: "INC-001",
    type: "trace",
    content: `FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
 1: 0xac65f0 node::Abort() [node]
 2: 0x9e312b node::FatalError(char const*, char const*) [node]
 3: 0xb5a76e v8::Utils::ReportOOMFailure(v8::internal::Isolate*, char const*, bool) [node]
 4: 0xb5aae7 v8::internal::V8::FatalProcessOutOfMemory(v8::internal::Isolate*, char const*, bool) [node]
 5: 0xd6f7b5  [node]
 6: 0xd732cc v8::internal::Heap::RecomputeLimits(v8::internal::GarbageCollector) [node]
 7: 0xd7c093 v8::internal::Heap::PerformGarbageCollection(...) [node]
 8: 0xd7cd98 v8::internal::Heap::CollectGarbage(...) [node]
 9: 0xd9e5a1 v8::internal::Factory::NewClosure(...) [node]
10: 0x13cbe82  [node]
11: 0x5a2d1f9b3e10  (notification-manager.ts:147)`,
  },
  {
    id: "ev_001_workflow",
    incidentId: "INC-001",
    type: "workflow",
    content: `name: CI/CD Pipeline
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run test
      - run: npm run build`,
  },
  {
    id: "ev_002_log",
    incidentId: "INC-002",
    type: "log",
    content: `postgres_1  | LOG:  database system is ready to accept connections
worker_1    | Loading model weights...
worker_1    | Initializing evaluation threads...
postgres_1  | WARNING:  active database connections: 98 / 100 max_connections
postgres_1  | FATAL:  remaining connection slots are reserved for non-replication superuser connections
worker_1    | ConnectionError: Could not retrieve connection from pool in 5000ms`,
  },
];

export const mockRootCauses: RootCause[] = [
  {
    id: "rc_001",
    incidentId: "INC-001",
    primaryCause: "Missing unregister/off listener handler on NotificationManager destruction.",
    secondaryCauses: [
      "Stale context references preserved inside event listener closures.",
      "High frequency of notification preference page mounting during bulk sync.",
    ],
    affectedServices: ["user-api", "notification-worker"],
    confidence: 92,
    reasoning: "Analysis of the heap snapshot diff shows 5,000+ instances of NotificationSettingsView retaining references to the notification system. Each allocation corresponds to a 'change' listener added during view initialization without cleanups in the component unmount lifecycles.",
  },
  {
    id: "rc_002",
    incidentId: "INC-002",
    primaryCause: "Connections are checked out from database pool inside long-running ML model load thread operations.",
    secondaryCauses: [
      "Evaluation threads hold active cursors without timeouts.",
      "Maximum database connections value restricted to default 100 on DB container.",
    ],
    affectedServices: ["ml-pipeline"],
    confidence: 96,
    reasoning: "The code in worker.py opens a database transaction block before initializing the neural network loader, which blocks the connection slot for up to 45 seconds per thread.",
  },
];

export const mockRecommendations: Recommendation[] = [
  {
    id: "rec_001_1",
    incidentId: "INC-001",
    type: "immediate",
    title: "Implement clean-up listener code in destroy hooks",
    description: "Explicitly invoke `notificationEmitter.off('change', this.handleChange)` inside the SettingsView destroy/unmount handlers.",
    confidence: 95,
    effort: "low",
    risk: "low",
    accepted: true,
  },
  {
    id: "rec_001_2",
    incidentId: "INC-001",
    type: "safer",
    title: "Implement a WeakRef notification registry pattern",
    description: "Migrate the event dispatch registry to use WeakRefs to reference view listeners, enabling automatic Garbage Collection cleanups without explicit destroy hooks.",
    confidence: 82,
    effort: "medium",
    risk: "medium",
    accepted: false,
  },
  {
    id: "rec_001_3",
    incidentId: "INC-001",
    type: "architectural",
    title: "Decouple notifications to message broker architecture",
    description: "Replace standard local EventEmitters with Redis Pub/Sub channels to decouple service instances and resolve state retention issues.",
    confidence: 76,
    effort: "high",
    risk: "low",
    accepted: false,
  },
];

export const mockPatches: Patch[] = [
  {
    id: "patch_001",
    incidentId: "INC-001",
    diff: `diff --git a/src/services/notification-manager.ts b/src/services/notification-manager.ts
index d8a2ef1..f4c92b5 100644
--- a/src/services/notification-manager.ts
+++ b/src/services/notification-manager.ts
@@ -14,6 +14,7 @@ export class NotificationSettingsView {
   constructor(userId: string) {
     this.userId = userId;
     this.handleChange = this.handleChange.bind(this);
+    notificationEmitter.on('change', this.handleChange);
   }
 
   private handleChange(data: any) {
@@ -21,4 +22,8 @@ export class NotificationSettingsView {
       this.sendNotificationAlert(data);
     }
   }
+
+  public destroy() {
+    notificationEmitter.off('change', this.handleChange);
+  }
 }`,
    affectedFiles: ["src/services/notification-manager.ts"],
    explanation: "Explicitly adds a `destroy()` lifecycle method to `NotificationSettingsView` which unsubscribes from `notificationEmitter`. Prevents the listener closure from remaining pinned in the event emitter queue.",
    sideEffects: "Requires consumer components calling `NotificationSettingsView` instances to invoke `destroy()` during page transition or cleanup hooks.",
  },
];

export const mockValidations: Validation[] = [
  {
    id: "val_001",
    patchId: "patch_001",
    incidentId: "INC-001",
    testsPassed: 12,
    testsFailed: 0,
    lintStatus: "passed",
    securityStatus: "passed",
    overallStatus: "passed",
    report: `[Sandbox] Code linting check: OK
[Sandbox] Security scanner checking packages: OK
[Sandbox] running test cases:
  ✓ test_notification_rendering (12ms)
  ✓ test_settings_preference_override (45ms)
  ✓ test_leak_cleanup_mechanism (420ms) - Leak test verified, heap remains flat.
All tests completed. status: PASS`,
  },
];

export const mockPullRequests: PullRequest[] = [
  {
    id: "pr_001",
    patchId: "patch_001",
    incidentId: "INC-001",
    prNumber: 142,
    prUrl: "https://github.com/acme-corp/user-api/pull/142",
    title: "fix: Fix memory leak in notification settings emitter change listeners",
    body: `## Summary
This automated pull request resolves the memory leak detected in **user-api**. The Root Cause Agent determined that event emitter listeners added in \`NotificationSettingsView\` were not cleaned up when the views unmounted.

### Root Cause
\`NotificationSettingsView\` constructor registers a listener on the global \`notificationEmitter\` but doesn't unsubscribe, blocking garbage collection from reclaiming the context closure.

### Changes
*   Added a \`destroy()\` method to \`NotificationSettingsView\` that calls \`off('change', this.handleChange)\`.

### Verification Status
*   **Tests:** 12/12 passed in sandboxed container.
*   **Heap Analysis:** Flat memory profile verified post-cleanup.
*   **Security Scans:** 0 critical alerts.`,
    status: "open",
    createdAt: "2026-06-29T23:30:35Z",
  },
];

export const mockPredictions: Prediction[] = [
  {
    id: "pred_001",
    repoId: "repo_user_api",
    riskScore: 78,
    failureProbability: 72,
    codeChurn: 0.45,
    complexityScore: 82,
    testCoverage: 68,
    previousFailures: 3,
    recommendation: "Increase unit test coverage on event-driven components. Refactor large controllers with high churn rate.",
    createdAt: "2026-06-29T23:00:00Z",
  },
  {
    id: "pred_002",
    repoId: "repo_ml_pipeline",
    riskScore: 45,
    failureProbability: 38,
    codeChurn: 0.21,
    complexityScore: 54,
    testCoverage: 80,
    previousFailures: 1,
    recommendation: "Add connection load profiling on upcoming thread pool deployments.",
    createdAt: "2026-06-29T22:30:00Z",
  },
  {
    id: "pred_003",
    repoId: "repo_payments_go",
    riskScore: 22,
    failureProbability: 15,
    codeChurn: 0.08,
    complexityScore: 32,
    testCoverage: 92,
    previousFailures: 0,
    recommendation: "No immediate actions required. Maintain solid pipeline practices.",
    createdAt: "2026-06-29T18:15:00Z",
  },
];

export const mockKnowledgeEntries: KnowledgeEntry[] = [
  {
    id: "kb_001",
    orgId: "org_acme",
    repoId: "repo_user_api",
    incidentId: "INC-001",
    category: "pattern",
    title: "Node.js Event Listener Memory Leak (CS Level 4 & DDIA)",
    content: "EventEmitter retaining listener references is a classic memory leak pattern. In V8 (Node.js), event handlers retain scope closures, meaning the listener keeps the host component or view alive indefinitely. Recommended practice: always call emitter.off() or unsubscribe in teardown/unmount hooks, or leverage WeakRef registries as noted in clean memory patterns.",
    tags: ["node.js", "memory-leak", "v8", "garbage-collection"],
    createdAt: "2026-06-27T10:00:00Z",
  },
  {
    id: "kb_002",
    orgId: "org_acme",
    repoId: "repo_ml_pipeline",
    incidentId: "INC-002",
    category: "fix",
    title: "Python Connection Pool Starvation (CS Level 2 & DDIA)",
    content: "In multithreaded systems, holding a connection during a slow network request or model load halts the pool thread limit. Fix: Always use contextual managers (with/try-finally) to acquire and release connections early. Avoid keeping active DB connections open during non-DB operations like loading ML weights.",
    tags: ["python", "postgresql", "concurrency", "pooling"],
    createdAt: "2026-06-25T14:30:00Z",
  },
  {
    id: "kb_003",
    orgId: "org_acme",
    repoId: "repo_payments_go",
    incidentId: "INC-003",
    category: "pattern",
    title: "Unhandled Promise Rejections in SaaS Stripe Webhooks (CS Level 15)",
    content: "Webhook verification relies on Stripe SDK signature validation using cryptographic keys. signature mismatch throws runtime exceptions. Without global error boundaries, Node or Go web service handles crash immediately. Always wrap SDK signature construct calls in a strict try-catch block and map them to HTTP 400 Bad Request.",
    tags: ["stripe", "async", "error-handling", "saas-engineering"],
    createdAt: "2026-06-20T08:15:00Z",
  },
  {
    id: "kb_004",
    orgId: "org_acme",
    repoId: "repo_user_api",
    category: "architecture",
    title: "CAP Theorem & Partition Tolerance (CS Level 8 & Distributed Systems)",
    content: "Under network partition (P), a system must choose between Consistency (C) or Availability (A). For payments-go, we prioritize Consistency (CP) using PostgreSQL read-after-write configurations, rejecting requests if master nodes disconnect, rather than allowing split-brain write conflicts.",
    tags: ["cap-theorem", "distributed-systems", "database-design"],
    createdAt: "2026-06-18T11:00:00Z",
  },
  {
    id: "kb_005",
    orgId: "org_acme",
    repoId: "repo_ml_pipeline",
    category: "pattern",
    title: "Transformers, Attention Mechanisms & GPU CUDA Allocation (Level 12)",
    content: "GPU Out-of-Memory (OOM) during transformer scaling is caused by quadratic attention weights memory profile (O(N^2) where N is token sequence length). Mitigation: use FlashAttention v2 to optimize IO memory access speeds, and implement gradient accumulation to lower absolute batch requirements.",
    tags: ["transformers", "cuda", "deep-learning", "machine-learning"],
    createdAt: "2026-06-15T09:20:00Z",
  },
  {
    id: "kb_006",
    orgId: "org_acme",
    repoId: "repo_user_api",
    category: "recommendation",
    title: "OWASP Top 10: CSRF & Session Authentication Security (Level 9)",
    content: "Stateless JWT authentication stored in localStorage exposes applications to Cross-Site Scripting (XSS) tokens theft. Instead, use HTTPOnly, Secure, SameSite=Lax cookie-based sessions, and introduce double-submit cookies protection or anti-CSRF token verification on state-modifying requests.",
    tags: ["security", "owasp-top-10", "authentication", "jwt"],
    createdAt: "2026-06-12T16:45:00Z",
  },
  {
    id: "kb_007",
    orgId: "org_acme",
    repoId: "repo_payments_go",
    category: "fix",
    title: "Raft Consensus Algorithm & Split-Brain Mitigation (CS Level 8)",
    content: "When dynamic cluster size configurations undergo changes, a split-brain election can happen if dual leaders emerge. Prevent this by enforcing single-node consensus transitions (joint consensus) and ensuring heartbeats are validated before initiating term updates.",
    tags: ["raft-consensus", "distributed-systems", "algorithms"],
    createdAt: "2026-06-10T14:10:00Z",
  },
  {
    id: "kb_008",
    orgId: "org_acme",
    repoId: "repo_user_api",
    category: "architecture",
    title: "SOLID Principles & Large Scale Refactoring (CS Level 3 & Clean Code)",
    content: "Avoid Monolithic Controller bloat by enforcing Single Responsibility Principle (SRP) and Dependency Inversion. Move db operations to repositories, logic to service classes, and inject implementations through interfaces to facilitate painless sandbox mocking and testing.",
    tags: ["solid", "design-patterns", "clean-code", "refactoring"],
    createdAt: "2026-06-08T10:05:00Z",
  },
  {
    id: "kb_009",
    orgId: "org_acme",
    repoId: "repo_ml_pipeline",
    category: "pattern",
    title: "RAG & Vector Database Query Optimization (Level 13 & Qdrant)",
    content: "Vector search latency rises as dataset scales. Optimize HNSW graphs search speeds in Qdrant by setting optimal M and ef_construct parameters. Balance precision vs latency tradeoff: lower construction time by choosing scalar quantization for embeddings representations.",
    tags: ["rag", "vector-search", "qdrant", "llm-engineering"],
    createdAt: "2026-06-05T13:30:00Z",
  },
  {
    id: "kb_010",
    orgId: "org_acme",
    repoId: "repo_payments_go",
    category: "recommendation",
    title: "Stripe Double Charge Avoidance: Idempotency Keys (Level 15 & 16)",
    content: "Avoid duplicate billing charges during network retry drops by generating unique Idempotency Keys at the client level. Store requested keys in Redis with short TTL expiry, checking requests against keys before routing payments processing transactions.",
    tags: ["saas-engineering", "stripe", "billing", "api-design"],
    createdAt: "2026-06-02T11:40:00Z",
  },
  {
    id: "kb_011",
    orgId: "org_acme",
    repoId: "repo_user_api",
    category: "pattern",
    title: "TCP Congestion Control & Virtual Memory Paging Limits (Level 2)",
    content: "In Linux OS operations (CS:APP context), physical memory exhaustion causes swapping. As paging rates rise, CPU performance degrades. This network slowdown increases round-trip times, triggering TCP slow-start and reducing packet delivery throughput.",
    tags: ["linux", "operating-systems", "tcp-ip", "networking"],
    createdAt: "2026-05-30T09:15:00Z",
  },
  {
    id: "kb_012",
    orgId: "org_acme",
    repoId: "repo_ml_pipeline",
    category: "architecture",
    title: "Multi-Agent Coordination: LangGraph & Model Context Protocol (Level 13)",
    content: "Building complex autonomous agent pipelines requires structured DAG workflows. Use LangGraph to model cycles, checkpoints, and shared memory states. Expose database interfaces as tools using the Model Context Protocol (MCP) to streamline agent interactions.",
    tags: ["langgraph", "mcp", "agents", "multi-agent-systems"],
    createdAt: "2026-05-25T15:20:00Z",
  },
  {
    id: "kb_013",
    orgId: "org_acme",
    repoId: "repo_payments_go",
    category: "fix",
    title: "Database Indexing, ACID & Lock Escalations (Level 2 & SDI Book)",
    content: "Concurrent postgres updates without proper indexes escalate to full-table locks. Fix: Create targeted indexes on foreign keys to prevent sequential scans, and keep transaction scopes narrow to avoid blocking concurrent database requests.",
    tags: ["acid", "database-systems", "indexing", "postgresql"],
    createdAt: "2026-05-20T08:50:00Z",
  },
  {
    id: "kb_014",
    orgId: "org_acme",
    repoId: "repo_user_api",
    category: "architecture",
    title: "Microservices & Distributed Tracing: OpenTelemetry & Jaeger (Level 18)",
    content: "Tracing latency across microservices requires correlation IDs. Propagate trace contexts downstream via HTTP headers using OpenTelemetry standards. Export telemetry traces to Jaeger or Datadog to identify bottleneck services in the call stack.",
    tags: ["opentelemetry", "jaeger", "microservices", "monitoring"],
    createdAt: "2026-05-15T14:10:00Z",
  },
  {
    id: "kb_015",
    orgId: "org_acme",
    repoId: "repo_ml_pipeline",
    category: "recommendation",
    title: "Data Lakes: Apache Spark & Airflow ETL Orchestration (Level 19)",
    content: "Ingesting telemetry files into Parquet formats requires robust scheduling. Use Apache Airflow to orchestrate Apache Spark jobs, checking data partitions for quality before loading records into database analytics systems.",
    tags: ["data-engineering", "spark", "airflow", "etl"],
    createdAt: "2026-05-10T10:30:00Z",
  },
  {
    id: "kb_016",
    orgId: "org_acme",
    repoId: "repo_ml_pipeline",
    category: "architecture",
    title: "DeepSpec Speculative Decoding Pipeline: DSpark & DFlash (Level 13 & 14)",
    content: "IncidentPilot's agent execution speeds are optimized using DeepSpec speculative decoding draft models. By running smaller draft networks (DSpark, DFlash, Eagle3) to propose patch generations, verified in parallel by the target model, inference latency is reduced by up to 3.2x with zero loss in mathematical correctness.",
    tags: ["deepspec", "speculative-decoding", "inference-optimization", "deepseek"],
    createdAt: "2026-06-30T14:45:00Z",
  },
];

export const mockRepoLogs: RepoLog[] = [
  {
    id: "log_001_1",
    repoId: "repo_user_api",
    type: "commit",
    title: "feat: Add event dispatch system for notification settings",
    description: "Introduced EventEmitter listeners inside NotificationSettingsView (Commit 8a4d2f19)",
    author: "sarah.chen",
    createdAt: "2026-06-29T23:30:00Z",
  },
  {
    id: "log_001_2",
    repoId: "repo_user_api",
    type: "settings_changed",
    title: "Configure alerts channel",
    description: "Changed Webhook Alert dispatch levels threshold from HIGH to MEDIUM",
    author: "jane.doe",
    createdAt: "2026-06-29T20:15:00Z",
  },
  {
    id: "log_001_3",
    repoId: "repo_user_api",
    type: "branch_created",
    title: "Branch created: feat/notifications",
    description: "Branch feat/notifications branched from main base",
    author: "sarah.chen",
    createdAt: "2026-06-29T18:00:00Z",
  },
  {
    id: "log_002_1",
    repoId: "repo_ml_pipeline",
    type: "commit",
    title: "fix: Add multi-threading support to evaluation pipeline",
    description: "Added multi-threading support to evaluate parallel queries (Commit 4c9b1e22)",
    author: "alex.kumar",
    createdAt: "2026-06-29T23:10:00Z",
  },
  {
    id: "log_002_2",
    repoId: "repo_ml_pipeline",
    type: "settings_changed",
    title: "Tune scaler artifact path",
    description: "Configured telemetry pipeline to point to scale v2 recommendations weight models",
    author: "lisa.wang",
    createdAt: "2026-06-29T14:30:00Z",
  },
  {
    id: "log_003_1",
    repoId: "repo_payments_go",
    type: "commit",
    title: "refactor: Upgrade Stripe SDK and enhance checkout logic",
    description: "Upgraded backend Stripe SDK wrapper and modified checkout router handlers (Commit 1f3e5c9b)",
    author: "mike.johnson",
    createdAt: "2026-06-29T22:45:00Z",
  },
  {
    id: "log_003_2",
    repoId: "repo_payments_go",
    type: "import",
    title: "File uploaded for analysis",
    description: "Uploaded webhook_listener.go to trigger Stripe unhandled signature validation analysis",
    author: "mike.johnson",
    createdAt: "2026-06-29T22:42:00Z",
  },
];
import { RepoLog } from "../types";


