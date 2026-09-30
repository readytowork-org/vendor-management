// Per-item history for the trend and supplier tiles.
//
// Masters and line items arrive once via useCostDb. History is a different
// shape of query — one item and one location at a time — so it is fetched
// here, whenever the selection changes.

import { useEffect, useState } from "react";
import { costDbRepository } from "../data";
import type { LocationKey, OrderHistoryEntry, PriceHistoryEntry } from "../domain/types";

export interface ItemHistory {
  /** Price history table. null when the item has no rows. */
  priceHistory: PriceHistoryEntry | null;
  /** Purchase order history table. null when the item has no rows. */
  orderHistory: OrderHistoryEntry | null;
  loading: boolean;
}

interface Loaded extends Omit<ItemHistory, "loading"> {
  /** Selection this result belongs to; stale results are ignored. */
  key: string;
}

export function useItemHistory(no: number | null, locationKey: LocationKey): ItemHistory {
  const key = no === null || !locationKey ? null : `${no}|${locationKey}`;
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    if (key === null || no === null) return;
    let cancelled = false;

    async function load(itemNo: number, requestKey: string) {
      try {
        const [prices, orders] = await Promise.all([
          costDbRepository.listPriceHistory(itemNo, locationKey),
          costDbRepository.listOrderHistory(itemNo, locationKey),
        ]);
        if (cancelled) return;
        setLoaded({
          key: requestKey,
          priceHistory: prices[0] ?? null,
          orderHistory: orders[0] ?? null,
        });
      } catch (err) {
        // The tiles fall back to the estimated figures, so this is not fatal.
        if (cancelled) return;
        console.error("[COSTDB] Failed to load item history:", err);
        setLoaded({ key: requestKey, priceHistory: null, orderHistory: null });
      }
    }

    void load(no, key);
    return () => {
      cancelled = true;
    };
  }, [key, no, locationKey]);

  // Anything for a previous selection counts as still loading.
  const fresh = loaded?.key === key ? loaded : null;

  return {
    priceHistory: fresh?.priceHistory ?? null,
    orderHistory: fresh?.orderHistory ?? null,
    loading: key !== null && fresh === null,
  };
}
