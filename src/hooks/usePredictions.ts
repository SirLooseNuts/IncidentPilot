import { useState, useEffect } from "react";
import { store } from "@/lib/data/store";
import { Prediction } from "@/lib/types";

export function usePredictions() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPredictions(store.getPredictions());
    setLoading(false);

    const unsubscribe = store.subscribe(() => {
      setPredictions(store.getPredictions());
    });

    return unsubscribe;
  }, []);

  return { predictions, loading };
}
