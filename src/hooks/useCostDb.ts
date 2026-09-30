// Loads masters and line items from the active source.

import { useCallback, useEffect, useState } from "react";
import { costDbRepository } from "../data";
import type { CostDbMasters, CostItem } from "../domain/types";

const LOAD_TIMEOUT_MS = 20000;

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

export function useCostDb(powerAppsHostAvailable = true): UseCostDbResult {
  const [data, setData] = useState<CostDbData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  const canLoad = costDbRepository.kind !== "dataverse" || powerAppsHostAvailable;

  useEffect(() => {
    if (!canLoad) return;
    let cancelled = false;
    let timeoutId: ReturnType<typeof globalThis.setTimeout>;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const loadData = Promise.all([
          costDbRepository.loadMasters(),
          costDbRepository.listItems(),
        ]);
        const timeout = new Promise<never>((_, reject) => {
          timeoutId = globalThis.setTimeout(
            () => reject(new Error("Dataverse did not respond within 20 seconds. Check your connection and reload.")),
            LOAD_TIMEOUT_MS,
          );
        });
        const [masters, items] = await Promise.race([loadData, timeout]);
        if (!cancelled) setData({ masters, items });
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message || "Data retrieval failed.");
          console.error("[Vendor Management] Failed to load data:", err);
        }
      } finally {
        globalThis.clearTimeout(timeoutId);
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [canLoad, nonce]);

  return { data, loading, error, source: costDbRepository.kind, reload };
}
