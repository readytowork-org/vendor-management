// Domain types shared by the UI and the data layer.

/** Location key, e.g. "tokyo". Environment stable. */
export type LocationKey = string;

/** Fiscal year key, e.g. "2025" or "current". */
export type YearKey = string;

/** Major category (~10 rows): Ⅰ, Ⅱ, Ⅲ … */
export interface MajorCategory {
  no: string;
  name: string;
  /** Whether prices exist and the UI may select it. */
  enabled: boolean;
}

/** Middle category (~80 rows): 1, 2, … 5 rebar work … */
export interface MiddleCategory {
  no: number;
  name: string;
  enabled: boolean;
}

/** Location master. */
export interface LocationDef {
  key: LocationKey;
  /** Display name, e.g. 東京. */
  label: string;
  /** Prefecture, e.g. 東京都. */
  pref: string;
  /** Whether unit prices are registered here. */
  registered: boolean;
}

/** factor is the rate against the base year. */
export interface YearDef {
  key: YearKey;
  label: string;
  factor: number;
}

/** Line item (~2,000 rows) plus its per-location prices. */
export interface CostItem {
  /** Line item number. Unique key used by the UI. */
  no: number;
  /** Major category number, e.g. "Ⅱ". */
  daiNo: string;
  /** Middle category number, e.g. 5. */
  chuNo: number;
  /** Middle category name. */
  chuName: string;
  /** Item name. */
  name: string;
  /** Remarks, such as the specification. */
  note: string;
  /** Unit of measure. */
  unit: string;
  /** Cost-Navi price for the base year. null if unset. */
  costnavi: number | null;
  /** Base-year price keyed by location. Missing if unset. */
  prices: Partial<Record<LocationKey, number | null>>;
  /** Recorded prices by fiscal year and vendor. */
  yearPrices?: Partial<Record<YearKey, Partial<Record<LocationKey, number>>>>;
  /** Average recorded vendor price by fiscal year. */
  costnaviHistory?: Partial<Record<YearKey, number>>;
  /** Dataverse row GUID. undefined for mock data. */
  id?: string;
}

/** Supplier master, used by the order share chart. */
export interface Supplier {
  name: string;
  /** Order price as a ratio of the location price. */
  priceRatio: number;
  /** Baseline value for the order share. */
  shareSeed: number;
}

/** Price history: item x location x fiscal year. */
export interface PriceHistoryEntry {
  locationKey: LocationKey;
  no: number;
  /** Fiscal year key to price. */
  prices: Partial<Record<YearKey, number>>;
}

/** Purchase order history: project x supplier. */
export interface OrderHistoryEntry {
  locationKey: LocationKey;
  no: number;
  /** Standard unit price. */
  standard: number;
  orders: OrderRecord[];
}

export interface OrderRecord {
  project: string;
  supplier: string;
  price: number;
}

/** Every master list the UI needs. */
export interface CostDbMasters {
  majorCategories: MajorCategory[];
  middleCategories: MiddleCategory[];
  locations: LocationDef[];
  prefectures: string[];
  years: YearDef[];
  /** X axis of the trend chart, oldest first. */
  trendYears: YearKey[];
  suppliers: Supplier[];
}

/** Item filter. Becomes an OData $filter. */
export interface ItemQuery {
  daiNo?: string;
  chuNo?: number;
  /** Substring match on name, note and category name. */
  keyword?: string;
  /** Row limit. Repository default when omitted. */
  top?: number;
}
