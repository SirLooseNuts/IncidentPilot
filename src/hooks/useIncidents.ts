import { useState, useEffect } from "react";
import { store } from "@/lib/data/store";
import { Incident, Severity, IncidentStatus } from "@/lib/types";

interface UseIncidentsFilter {
  severity?: Severity[];
  status?: IncidentStatus[];
  repoId?: string;
}

export function useIncidents(filters?: UseIncidentsFilter) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndFilter = () => {
      let data = store.getIncidents();

      if (filters) {
        if (filters.severity && filters.severity.length > 0) {
          data = data.filter((inc) => filters.severity!.includes(inc.severity));
        }
        if (filters.status && filters.status.length > 0) {
          data = data.filter((inc) => filters.status!.includes(inc.status));
        }
        if (filters.repoId) {
          data = data.filter((inc) => inc.repoId === filters.repoId);
        }
      }

      setIncidents(data);
    };

    fetchAndFilter();
    setLoading(false);

    const unsubscribe = store.subscribe(() => {
      fetchAndFilter();
    });

    return unsubscribe;
  }, [filters]);

  const addIncident = (incident: Incident) => {
    store.addIncident(incident);
  };

  const updateIncident = (id: string, updates: Partial<Incident>) => {
    store.updateIncident(id, updates);
  };

  return { incidents, loading, addIncident, updateIncident };
}
