export type Severity = "critical" | "high" | "medium" | "low";
export type IncidentStatus = "detected" | "investigating" | "root_caused" | "patched" | "validated" | "pr_created" | "resolved";
export type AgentStatus = "idle" | "running" | "success" | "failed";
export type RiskLevel = "low" | "moderate" | "high" | "critical";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  createdAt: string;
}

export interface Profile {
  id: string;
  orgId: string;
  fullName: string;
  avatarUrl: string;
  role: string;
}

export interface Repository {
  id: string;
  orgId: string;
  name: string;
  fullName: string;
  provider: "github" | "gitlab";
  defaultBranch: string;
  primaryLanguage: string;
  servicesCount: number;
  riskScore: number;
  status: "active" | "analyzing" | "idle";
  lastAnalyzedAt: string;
  createdAt: string;
}

export interface Incident {
  id: string;
  repoId: string;
  orgId: string;
  title: string;
  severity: Severity;
  status: IncidentStatus;
  commitSha: string;
  commitMessage: string;
  author: string;
  branch: string;
  pipelineStage: number; // 1-9
  createdAt: string;
  resolvedAt?: string;
}

export interface AgentRun {
  id: string;
  incidentId: string;
  agentName: string;
  agentType:
    | "monitoring"
    | "context"
    | "root_cause"
    | "recommendation"
    | "patch"
    | "validation"
    | "pr"
    | "learning"
    | "prediction";
  status: AgentStatus;
  inputSummary: string;
  outputSummary: string;
  confidence: number; // 0-100
  durationMs: number;
  startedAt: string;
  completedAt?: string;
}

export interface Evidence {
  id: string;
  incidentId: string;
  type: "log" | "trace" | "files" | "workflow";
  content: string;
  metadata?: Record<string, any>;
}

export interface RootCause {
  id: string;
  incidentId: string;
  primaryCause: string;
  secondaryCauses: string[];
  affectedServices: string[];
  confidence: number;
  reasoning: string;
}

export interface Recommendation {
  id: string;
  incidentId: string;
  type: "immediate" | "safer" | "architectural";
  title: string;
  description: string;
  confidence: number;
  effort: "low" | "medium" | "high";
  risk: "low" | "medium" | "high";
  accepted: boolean;
}

export interface Patch {
  id: string;
  incidentId: string;
  diff: string;
  affectedFiles: string[];
  explanation: string;
  sideEffects: string;
}

export interface Validation {
  id: string;
  patchId: string;
  incidentId: string;
  testsPassed: number;
  testsFailed: number;
  lintStatus: "passed" | "failed";
  securityStatus: "passed" | "failed";
  overallStatus: "passed" | "failed";
  report: string;
}

export interface PullRequest {
  id: string;
  patchId: string;
  incidentId: string;
  prNumber: number;
  prUrl: string;
  title: string;
  body: string;
  status: "open" | "merged" | "closed";
  createdAt: string;
}

export interface Prediction {
  id: string;
  repoId: string;
  riskScore: number;
  failureProbability: number;
  codeChurn: number; // lines changed / total
  complexityScore: number;
  testCoverage: number;
  previousFailures: number;
  recommendation: string;
  createdAt: string;
}

export interface KnowledgeEntry {
  id: string;
  orgId: string;
  repoId: string;
  incidentId?: string;
  category: "pattern" | "fix" | "architecture" | "recommendation";
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
}
