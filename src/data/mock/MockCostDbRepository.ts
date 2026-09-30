// Sample data so the UI runs without Dataverse.

import type { CostDbRepository, RepositoryKind } from "../CostDbRepository";
import type {
  CostDbMasters,
  CostItem,
  ItemQuery,
  LocationKey,
  OrderHistoryEntry,
  PriceHistoryEntry,
} from "../../domain/types";
import { matches } from "../../domain/pricing";
import * as mock from "./mockCostDb";

/** Fake latency so loading states look real. */
const LATENCY_MS = 120;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));
}

export class MockCostDbRepository implements CostDbRepository {
  readonly kind: RepositoryKind = "mock";

  loadMasters(): Promise<CostDbMasters> {
    return delay(mock.masters);
  }

  listItems(query: ItemQuery = {}): Promise<CostItem[]> {
    let rows: CostItem[] = mock.items;
    if (query.daiNo) rows = rows.filter((it) => it.daiNo === query.daiNo);
    if (query.chuNo !== undefined) rows = rows.filter((it) => it.chuNo === query.chuNo);
    if (query.keyword) rows = rows.filter((it) => matches(it, query.keyword));
    if (query.top !== undefined) rows = rows.slice(0, query.top);
    return delay(rows);
  }

  listPriceHistory(no: number, locationKey: LocationKey): Promise<PriceHistoryEntry[]> {
    return delay(
      mock.priceHistory.filter((h) => h.no === no && h.locationKey === locationKey),
    );
  }

  listOrderHistory(no: number, locationKey: LocationKey): Promise<OrderHistoryEntry[]> {
    return delay(
      mock.orderHistory.filter((h) => h.no === no && h.locationKey === locationKey),
    );
  }
}
