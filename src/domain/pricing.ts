// Unit price maths. Non-base years are estimated, not real.

import { round1 } from "./format";
import type {
  CostDbMasters,
  CostItem,
  LocationDef,
  LocationKey,
  OrderHistoryEntry,
  Supplier,
  YearDef,
  YearKey,
} from "./types";

export interface SupplierRow {
  name: string;
  /** Order share, as a percentage. */
  share: number;
  /** Order unit price. */
  price: number;
}

/** Per-item weight (0.5-2.0) on the revision rate. */
export function yearWeight(item: CostItem | null): number {
  if (!item || item.no === 105) return 1;
  return 0.5 + ((item.no * 13) % 10) / 6;
}

/**
 * Real supplier split, aggregated from the purchase order history table.
 * Share is the supplier's total order amount as a percentage of all orders.
 * Price is their mean order price.
 * Returns [] when the item has no order rows, so the caller can fall back.
 */
export function supplierRowsFromOrders(entry: OrderHistoryEntry | null): SupplierRow[] {
  if (!entry || !entry.orders.length) return [];

  const bySupplier = new Map<string, { count: number; total: number }>();
  for (const order of entry.orders) {
    const current = bySupplier.get(order.supplier) ?? { count: 0, total: 0 };
    current.count += 1;
    current.total += order.price;
    bySupplier.set(order.supplier, current);
  }

  const totalAmount = entry.orders.reduce((sum, o) => sum + o.price, 0);
  const rows: SupplierRow[] = [...bySupplier].map(([name, agg]) => ({
    name,
    share: round1((agg.total / totalAmount) * 100),
    price: round1(agg.total / agg.count),
  }));

  // Largest first, then absorb the rounding remainder so shares total 100.
  rows.sort((a, b) => b.share - a.share);
  const sum = rows.slice(0, -1).reduce((a, r) => a + r.share, 0);
  rows[rows.length - 1].share = round1(100 - sum);
  return rows;
}

/** Display label: name plus remarks. */
export function itemLabel(item: CostItem | null): string {
  if (!item) return "";
  return item.name + (item.note ? "　" + item.note : "");
}

/** Substring match on name, note, category, no. */
export function matches(item: CostItem, text: string | undefined): boolean {
  if (!text) return true;
  const t = text.toLowerCase();
  return (
    item.name.toLowerCase().includes(t) ||
    String(item.note).toLowerCase().includes(t) ||
    item.chuName.toLowerCase().includes(t) ||
    String(item.no).includes(t)
  );
}

/** Builds the price functions bound to a set of masters. */
export function createPricing(masters: CostDbMasters) {
  const locationKeys = masters.locations.map((l) => l.key);

  function yearDef(key: YearKey): YearDef {
    return (
      masters.years.find((y) => y.key === key) ??
      masters.years.find((y) => y.factor === 1) ??
      masters.years[0]
    );
  }

  /** null for an unregistered location, e.g. "pref:X". */
  function locationDef(value: LocationKey | null): LocationDef | null {
    if (!value) return null;
    return masters.locations.find((l) => l.key === value) ?? null;
  }

  // TODO: drop this once every year has real history data.
  function yearFactor(item: CostItem | null, yearKey: YearKey): number {
    return 1 + (yearDef(yearKey).factor - 1) * yearWeight(item);
  }

  /** True when every location price is a whole yen amount. */
  function isWholeYenItem(item: CostItem | null): boolean {
    if (!item) return false;
    return locationKeys.every((k) => {
      const v = item.prices[k];
      return v === null || v === undefined || Number.isInteger(v);
    });
  }

  /** Rounds to the precision the source data actually has. */
  function roundToItemPrecision(item: CostItem | null, rawValue: number | null): number | null {
    if (rawValue === null || Number.isNaN(rawValue)) return rawValue;
    return isWholeYenItem(item) ? Math.round(rawValue) : round1(rawValue);
  }

  /** Price for a year and location, else null. */
  function priceOf(item: CostItem | null, locKey: LocationKey, yearKey: YearKey): number | null {
    if (!item) return null;
    const recorded = item.yearPrices?.[yearKey]?.[locKey];
    if (recorded !== null && recorded !== undefined) {
      return roundToItemPrecision(item, recorded);
    }
    const raw = item.prices[locKey];
    if (raw === null || raw === undefined) return null;
    return roundToItemPrecision(item, raw * yearFactor(item, yearKey));
  }

  /** Cost-Navi price, converted to the given year. */
  function costnaviOf(item: CostItem | null, yearKey: YearKey): number | null {
    const recorded = item?.costnaviHistory?.[yearKey];
    if (recorded !== null && recorded !== undefined) {
      return roundToItemPrecision(item, recorded);
    }
    if (!item || item.costnavi === null || item.costnavi === undefined) return null;
    return roundToItemPrecision(item, item.costnavi * yearFactor(item, yearKey));
  }

  // TODO: replace with a real order history aggregation.
  function supplierRows(
    item: CostItem | null,
    locKey: LocationKey,
    yearKey: YearKey,
  ): SupplierRow[] {
    const base = priceOf(item, locKey, yearKey);
    if (!item || base === null) return [];

    const suppliers: Supplier[] = masters.suppliers;
    if (!suppliers.length) return [];

    const raw = suppliers.map((s, i) => {
      const jitter = ((item.no * 7 + i * 13) % 11) - 5; // -5 to +5
      return Math.max(6, s.shareSeed + jitter);
    });
    const total = raw.reduce((a, b) => a + b, 0);

    const rows: SupplierRow[] = suppliers.map((s, i) => ({
      name: s.name,
      share: round1((raw[i] / total) * 100),
      price: roundToItemPrecision(item, base * s.priceRatio) ?? 0,
    }));

    // Absorb the remainder in the last row so shares total 100.
    const sum = rows.slice(0, -1).reduce((a, r) => a + r.share, 0);
    rows[rows.length - 1].share = round1(100 - sum);
    return rows;
  }

  return {
    yearDef,
    locationDef,
    yearFactor,
    isWholeYenItem,
    roundToItemPrecision,
    priceOf,
    costnaviOf,
    supplierRows,
  };
}

export type Pricing = ReturnType<typeof createPricing>;
