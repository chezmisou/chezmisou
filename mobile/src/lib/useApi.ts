import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { api } from "./api";

/**
 * Charge une API du site, avec rechargement par « tirer pour rafraîchir »
 * et rechargement silencieux quand l'écran revient au premier plan.
 */
export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(path !== null);
  const [refreshing, setRefreshing] = useState(false);
  const firstFocus = useRef(true);

  const load = useCallback(
    async (mode: "initial" | "refresh" | "silent") => {
      if (!path) return;
      if (mode === "refresh") setRefreshing(true);
      try {
        const result = await api<T>(path);
        setData(result);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur de chargement");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [path]
  );

  useEffect(() => {
    load("initial");
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      load("silent");
    }, [load])
  );

  return {
    data,
    error,
    loading,
    refreshing,
    refresh: () => load("refresh"),
    reload: () => load("silent"),
    setData,
  };
}
