import { useState, useEffect } from "react";
import { store } from "@/lib/data/store";
import {
  Incident,
  Evidence,
  RootCause,
  Recommendation,
  Patch,
  Validation,
  PullRequest,
} from "@/lib/types";

export function useIncident(id: string) {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [rootCause, setRootCause] = useState<RootCause | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [patch, setPatch] = useState<Patch | null>(null);
  const [validation, setValidation] = useState<Validation | null>(null);
  const [pullRequest, setPullRequest] = useState<PullRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      const inc = store.getIncident(id);
      if (!inc) {
        setIncident(null);
        setLoading(false);
        return;
      }

      setIncident(inc);
      setEvidence(store.getEvidence(id));
      setRootCause(store.getRootCause(id) || null);
      setRecommendations(store.getRecommendations(id));
      setPatch(store.getPatch(id) || null);
      setValidation(store.getValidation(id) || null);
      setPullRequest(store.getPullRequest(id) || null);
      setLoading(false);
    };

    fetchData();

    const unsubscribe = store.subscribe(() => {
      fetchData();
    });

    return unsubscribe;
  }, [id]);

  const acceptRecommendation = (recId: string) => {
    store.acceptRecommendation(recId);
  };

  const updateIncident = (updates: Partial<Incident>) => {
    store.updateIncident(id, updates);
  };

  return {
    incident,
    evidence,
    rootCause,
    recommendations,
    patch,
    validation,
    pullRequest,
    loading,
    acceptRecommendation,
    updateIncident,
  };
}
