import { useState, useEffect } from "react";
import { store } from "@/lib/data/store";
import { AgentRun } from "@/lib/types";

export function useAgentRuns(incidentId?: string) {
  const [agentRuns, setAgentRuns] = useState<AgentRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRuns = () => {
      setAgentRuns(store.getAgentRuns(incidentId));
    };

    fetchRuns();
    setLoading(false);

    const unsubscribe = store.subscribe(() => {
      fetchRuns();
    });

    return unsubscribe;
  }, [incidentId]);

  return { agentRuns, loading };
}
