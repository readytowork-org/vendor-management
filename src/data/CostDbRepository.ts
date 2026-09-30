// Data access contract. The UI knows nothing beyond this.

import type {
  CostDbMasters,
  CostItem,
  ItemQuery,
  LocationKey,
  OrderHistoryEntry,
  PriceHistoryEntry,
} from "../domain/types";

export type RepositoryKind = "mock" | "dataverse";

export interface CostDbRepository {
  readonly kind: RepositoryKind;

  /** Categories, locations, fiscal years and suppliers. */
  loadMasters(): Promise<CostDbMasters>;

  /** Line items with prices. query maps to $filter. */
  listItems(query?: ItemQuery): Promise<CostItem[]>;

  /** Price history. May return [] if not implemented. */
  listPriceHistory(no: number, locationKey: LocationKey): Promise<PriceHistoryEntry[]>;

  /** Purchase order history. May return []. */
  listOrderHistory(no: number, locationKey: LocationKey): Promise<OrderHistoryEntry[]>;
}
