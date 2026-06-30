import { useState, useEffect } from "react";
import { store } from "@/lib/data/store";
import { Repository } from "@/lib/types";

export function useRepositories() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    setRepositories(store.getRepositories());
    setLoading(false);

    // Subscribe to updates
    const unsubscribe = store.subscribe(() => {
      setRepositories(store.getRepositories());
    });

    return unsubscribe;
  }, []);

  const addRepository = (repo: Repository) => {
    store.addRepository(repo);
  };

  return { repositories, loading, addRepository };
}
