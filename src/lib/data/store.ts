import {
  mockOrg,
  mockRepositories,
  mockIncidents,
  mockAgentRuns,
  mockEvidence,
  mockRootCauses,
  mockRecommendations,
  mockPatches,
  mockValidations,
  mockPullRequests,
  mockPredictions,
  mockKnowledgeEntries,
} from "./seed";
import {
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
  Organization,
} from "../types";

type Listener = () => void;

class IncidentPilotStore {
  private listeners = new Set<Listener>();

  public org: Organization = { ...mockOrg };
  public repositories: Repository[] = [...mockRepositories];
  public incidents: Incident[] = [...mockIncidents];
  public agentRuns: AgentRun[] = [...mockAgentRuns];
  public evidence: Evidence[] = [...mockEvidence];
  public rootCauses: RootCause[] = [...mockRootCauses];
  public recommendations: Recommendation[] = [...mockRecommendations];
  public patches: Patch[] = [...mockPatches];
  public validations: Validation[] = [...mockValidations];
  public pullRequests: PullRequest[] = [...mockPullRequests];
  public predictions: Prediction[] = [...mockPredictions];
  public knowledgeEntries: KnowledgeEntry[] = [...mockKnowledgeEntries];

  // Subscribe to changes
  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Notify all subscribers
  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error("Error in store listener:", e);
      }
    });
  }

  // Repository Methods
  public getRepositories() {
    return this.repositories;
  }

  public getRepository(id: string) {
    return this.repositories.find((r) => r.id === id);
  }

  public addRepository(repo: Repository) {
    this.repositories = [repo, ...this.repositories];
    this.notify();
  }

  public updateRepositoryRisk(id: string, riskScore: number) {
    this.repositories = this.repositories.map((r) =>
      r.id === id ? { ...r, riskScore } : r
    );
    this.notify();
  }

  // Incident Methods
  public getIncidents() {
    return this.incidents;
  }

  public getIncident(id: string) {
    return this.incidents.find((i) => i.id === id);
  }

  public addIncident(incident: Incident) {
    this.incidents = [incident, ...this.incidents];
    this.notify();
  }

  public updateIncident(id: string, updates: Partial<Incident>) {
    this.incidents = this.incidents.map((i) =>
      i.id === id ? { ...i, ...updates } : i
    );
    this.notify();
  }

  // Agent Run Methods
  public getAgentRuns(incidentId?: string) {
    if (incidentId) {
      return this.agentRuns.filter((r) => r.incidentId === incidentId);
    }
    return this.agentRuns;
  }

  public addAgentRun(run: AgentRun) {
    this.agentRuns = [...this.agentRuns, run];
    this.notify();
  }

  public updateAgentRun(id: string, updates: Partial<AgentRun>) {
    this.agentRuns = this.agentRuns.map((r) =>
      r.id === id ? { ...r, ...updates } : r
    );
    this.notify();
  }

  // Evidence Methods
  public getEvidence(incidentId: string) {
    return this.evidence.filter((e) => e.incidentId === incidentId);
  }

  public addEvidence(ev: Evidence) {
    this.evidence = [...this.evidence, ev];
    this.notify();
  }

  // Root Cause Methods
  public getRootCause(incidentId: string) {
    return this.rootCauses.find((rc) => rc.incidentId === incidentId);
  }

  public addRootCause(rc: RootCause) {
    this.rootCauses = [...this.rootCauses, rc];
    this.notify();
  }

  // Recommendations Methods
  public getRecommendations(incidentId: string) {
    return this.recommendations.filter((r) => r.incidentId === incidentId);
  }

  public acceptRecommendation(id: string) {
    this.recommendations = this.recommendations.map((r) =>
      r.id === id ? { ...r, accepted: true } : r
    );
    this.notify();
  }

  public addRecommendation(rec: Recommendation) {
    this.recommendations = [...this.recommendations, rec];
    this.notify();
  }

  // Patch Methods
  public getPatch(incidentId: string) {
    return this.patches.find((p) => p.incidentId === incidentId);
  }

  public addPatch(patch: Patch) {
    this.patches = [...this.patches, patch];
    this.notify();
  }

  // Validation Methods
  public getValidation(incidentId: string) {
    return this.validations.find((v) => v.incidentId === incidentId);
  }

  public addValidation(val: Validation) {
    this.validations = [...this.validations, val];
    this.notify();
  }

  // PR Methods
  public getPullRequest(incidentId: string) {
    return this.pullRequests.find((pr) => pr.incidentId === incidentId);
  }

  public addPullRequest(pr: PullRequest) {
    this.pullRequests = [...this.pullRequests, pr];
    this.notify();
  }

  // Predictions Methods
  public getPredictions() {
    return this.predictions;
  }

  public getPredictionForRepo(repoId: string) {
    return this.predictions.find((p) => p.repoId === repoId);
  }

  public addPrediction(pred: Prediction) {
    this.predictions = [pred, ...this.predictions];
    this.notify();
  }

  // Knowledge Base Methods
  public getKnowledgeEntries() {
    return this.knowledgeEntries;
  }

  public addKnowledgeEntry(entry: KnowledgeEntry) {
    this.knowledgeEntries = [entry, ...this.knowledgeEntries];
    this.notify();
  }
}

// Global store singleton
export const store = new IncidentPilotStore();
