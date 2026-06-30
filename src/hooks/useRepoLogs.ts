import { useState, useEffect } from "react";
import { store } from "@/lib/data/store";
import { RepoLog } from "@/lib/types";

export function useRepoLogs(repoId?: string) {
  const [logs, setLogs] = useState<RepoLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = () => {
      setLogs(store.getRepoLogs(repoId));
    };

    fetchLogs();
    setLoading(false);

    const unsubscribe = store.subscribe(() => {
      fetchLogs();
    });

    return unsubscribe;
  }, [repoId]);

  const addLog = (log: RepoLog) => {
    store.addRepoLog(log);
  };

  return { logs, loading, addLog };
}
