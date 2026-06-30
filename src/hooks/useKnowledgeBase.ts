import { useState, useEffect } from "react";
import { store } from "@/lib/data/store";
import { KnowledgeEntry } from "@/lib/types";

export function useKnowledgeBase(searchQuery: string = "", category: string = "All") {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndFilter = () => {
      let data = store.getKnowledgeEntries();

      if (category && category !== "All") {
        const catMap: Record<string, string> = {
          patterns: "pattern",
          fixes: "fix",
          architecture: "architecture",
          recommendations: "recommendation",
        };
        const targetCategory = catMap[category.toLowerCase()] || category.toLowerCase();
        data = data.filter(
          (entry) => entry.category.toLowerCase() === targetCategory
        );
      }

      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        data = data.filter(
          (entry) =>
            entry.title.toLowerCase().includes(query) ||
            entry.content.toLowerCase().includes(query) ||
            entry.tags.some((t) => t.toLowerCase().includes(query))
        );
      }

      setEntries(data);
    };

    fetchAndFilter();
    setLoading(false);

    const unsubscribe = store.subscribe(() => {
      fetchAndFilter();
    });

    return unsubscribe;
  }, [searchQuery, category]);

  const addKnowledgeEntry = (entry: KnowledgeEntry) => {
    store.addKnowledgeEntry(entry);
  };

  return { entries, loading, addKnowledgeEntry };
}
