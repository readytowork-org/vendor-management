// Side nav entries and the "coming soon" screen copy.

import type { IconName } from "../components/Icon";

export type ScreenKey =
  | "dashboard"
  | "master-items"
  | "price-entry"
  | "price-history"
  | "vendors"
  | "import";

export interface ScreenDef {
  key: ScreenKey;
  title: string;
  icon: IconName;
  /** Placeholder copy. Absent for the dashboard. */
  desc?: string;
  list?: string[];
}

export const SCREENS: ScreenDef[] = [
  {
    key: "master-items",
    title: "Item master",
    icon: "ic-list",
    desc: "Manage construction items in a three-level structure: major category, middle category, and small item.",
    list: [
      "Select and filter items from the hierarchy tree",
      "Add, update, and deactivate small items while retaining history",
      "Register custom user-defined fields",
    ],
  },
  {
    key: "price-entry",
    title: "Price update",
    icon: "ic-tag",
    desc: "Register and revise unit prices by location and fiscal year while keeping prior values as history.",
    list: [
      "Bulk edit unit prices by location using an Excel-like grid",
      "Apply revision rates from cost-navi pricing data",
      "Record approval flow and update history",
    ],
  },
  {
    key: "price-history",
    title: "Price history",
    icon: "ic-history",
    desc: "Review historical unit prices and changes from the current value for each small item.",
    list: [
      "Display annual price trends for each small item with charts",
      "Automatically calculate revision rates and price increase percentages",
      "Compare project and supplier order price history",
    ],
  },
  {
    key: "vendors",
    title: "Supplier master",
    icon: "ic-building",
    desc: "Manage supplier contact details, trade categories, and supported locations.",
    list: [
      "Register and update supplier information, including location and trade category",
      "Review supplier order history and unit price records",
      "Manage suspension and caution flags",
    ],
  },
  {
    key: "import",
    title: "Data import",
    icon: "ic-import",
    desc: "Import external data such as cost-navi files and Excel-based price tables.",
    list: [
      "Upload Excel/CSV files and map columns",
      "Check for duplicates, missing values, and unit mismatches before import",
      "Review import logs and roll back results when needed",
    ],
  },
  {
    key: "dashboard",
    title: "Analytics dashboard",
    icon: "ic-chart",
  },
];

export function screenDef(key: ScreenKey): ScreenDef {
  return SCREENS.find((s) => s.key === key) ?? SCREENS[SCREENS.length - 1];
}
