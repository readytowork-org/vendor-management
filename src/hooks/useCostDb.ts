// Loads masters and line items from the active source.

import { useCallback, useEffect, useState } from "react";
import { costDbRepository } from "../data";
import type { CostDbMasters, CostItem } from "../domain/types";

export interface CostDbData {
  masters: CostDbMasters;
  items: CostItem[];
}

export interface UseCostDbResult {
  data: CostDbData | null;
  loading: boolean;
  error: string | null;
  /** Which source is active, so it is never guessed. */
  source: string;
  reload: () => void;
}

export function useCostDb(): UseCostDbResult {
  const [data, setData] = useState<CostDbData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [masters, items] = await Promise.all([
          costDbRepository.loadMasters(),
          costDbRepository.listItems(),
        ]);
        if (!cancelled) setData({ masters, items });
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message || "Data retrieval failed.");
          console.error("[COSTDB] Failed to load data:", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [nonce]);

  return { data, loading, error, source: costDbRepository.kind, reload };
}
