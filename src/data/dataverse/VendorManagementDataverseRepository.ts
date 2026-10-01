import type { CostDbRepository } from "../CostDbRepository";
import type {
  CostDbMasters,
  CostItem,
  ItemQuery,
  LocationKey,
  OrderHistoryEntry,
  PriceHistoryEntry,
  YearKey,
} from "../../domain/types";
import { PREFECTURES } from "../../domain/prefectures";
import { MAX_PAGE_SIZE } from "./schema";
import { rowsOf, serviceFor, type DataverseRow } from "./tableServices";

const TABLES = {
  units: { logicalName: "cdb_unit", entitySetName: "cdb_units" },
  categories: { logicalName: "cdb_materialcategory", entitySetName: "cdb_materialcategories" },
  vendors: { logicalName: "cdb_vendor", entitySetName: "cdb_vendors" },
  materials: { logicalName: "cdb_material", entitySetName: "cdb_materials" },
  materialVendors: { logicalName: "cdb_materialvendor", entitySetName: "cdb_materialvendors" },
  prices: {
    logicalName: "cdb_materialpriceperunit",
    entitySetName: "cdb_materialpriceperunits",
  },
  projects: { logicalName: "cdb_project", entitySetName: "cdb_projects" },
  projectMaterials: {
    logicalName: "cdb_projectmaterial",
    entitySetName: "cdb_projectmaterials",
  },
} as const;

const services = Object.fromEntries(
  Object.entries(TABLES).map(([key, table]) => [key, serviceFor(table)]),
) as Record<keyof typeof TABLES, ReturnType<typeof serviceFor>>;

interface PriceRecord {
  materialId: string;
  vendorId: string;
  unitId: string;
  year: YearKey;
  amount: number;
}

interface Snapshot {
  masters: CostDbMasters;
  items: CostItem[];
  prices: PriceRecord[];
  unitIdByNo: Map<number, string>;
  vendorNameById: Map<string, string>;
}

function text(row: DataverseRow, ...columns: string[]): string {
  for (const column of columns) {
    const value = row[column];
    if (value !== null && value !== undefined && String(value).trim()) return String(value).trim();
  }
  return "";
}

function number(row: DataverseRow, ...columns: string[]): number | null {
  for (const column of columns) {
    const value = row[column];
    if (value === null || value === undefined || value === "") continue;
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return null;
}

function lookup(row: DataverseRow, ...names: string[]): string {
  return text(row, ...names.flatMap((name) => [`_${name}_value`, name]));
}

function id(row: DataverseRow, ...columns: string[]): string {
  return text(row, ...columns);
}

function average(values: number[]): number | null {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

function aggregatePrices(rows: PriceRecord[]): Map<string, number> {
  const totals = new Map<string, { total: number; count: number }>();
  for (const row of rows) {
    const key = `${row.materialId}|${row.year}|${row.vendorId}`;
    const current = totals.get(key) ?? { total: 0, count: 0 };
    current.total += row.amount;
    current.count += 1;
    totals.set(key, current);
  }
  return new Map([...totals].map(([key, value]) => [key, value.total / value.count]));
}

export class VendorManagementDataverseRepository implements CostDbRepository {
  readonly kind = "dataverse" as const;
  private snapshotPromise: Promise<Snapshot> | null = null;

  private loadSnapshot(): Promise<Snapshot> {
    this.snapshotPromise ??= this.fetchSnapshot().catch((error: unknown) => {
      this.snapshotPromise = null;
      throw error;
    });
    return this.snapshotPromise;
  }

  private async fetchSnapshot(): Promise<Snapshot> {
    const options = { maxPageSize: MAX_PAGE_SIZE };
    const [unitRows, categoryRows, vendorRows, materialRows, materialVendorRows, priceRows, projectRows, projectMaterialRows] =
      await Promise.all([
        rowsOf(services.units, options),
        rowsOf(services.categories, options),
        rowsOf(services.vendors, options),
        rowsOf(services.materials, options),
        rowsOf(services.materialVendors, options),
        rowsOf(services.prices, options),
        rowsOf(services.projects, options),
        rowsOf(services.projectMaterials, options),
      ]);

    const unitNames = new Map<string, string>();
    for (const row of unitRows) {
      const unitId = id(row, "cdb_unitid");
      if (unitId) unitNames.set(unitId, text(row, "cdb_unitsymbol", "cdb_newcolumn", "cdb_code"));
    }

    const materialVendorsById = new Map(
      materialVendorRows
        .map((row) => [id(row, "cdb_materialvendorid"), row] as const)
        .filter(([key]) => key),
    );

    const prices: PriceRecord[] = priceRows.flatMap((row) => {
      const materialVendor = materialVendorsById.get(lookup(row, "cdb_materialvendorid"));
      const materialId = lookup(row, "cdb_materialid") || (materialVendor ? lookup(materialVendor, "cdb_materialid") : "");
      const vendorId = lookup(row, "cdb_vendorid") || (materialVendor ? lookup(materialVendor, "cdb_vendorid") : "");
      const unitId = lookup(row, "cdb_unitid") || (materialVendor ? lookup(materialVendor, "cdb_orderunitid") : "");
      const amount = number(row, "cdb_price");
      if (!materialId || !vendorId || amount === null) return [];
      return [{
        materialId,
        vendorId,
        unitId,
        year: text(row, "cdb_year") || "current",
        amount,
      }];
    });

    const vendorRowsById = new Map(
      vendorRows.map((row) => [id(row, "cdb_vendorid"), row] as const).filter(([key]) => key),
    );
    for (const price of prices) {
      if (!vendorRowsById.has(price.vendorId)) {
        vendorRowsById.set(price.vendorId, { cdb_vendorid: price.vendorId, cdb_name: "Vendor" });
      }
    }
    const vendorNameById = new Map(
      [...vendorRowsById].map(([vendorId, row]) => [vendorId, text(row, "cdb_name") || "Vendor"]),
    );

    const projectIds = new Set(
      projectRows
        .filter((row) => row.cdb_completed !== true)
        .map((row) => id(row, "cdb_projectid"))
        .filter(Boolean),
    );
    const projectCountByMaterial = new Map<string, Set<string>>();
    for (const row of projectMaterialRows) {
      const materialId = lookup(row, "cdb_materialid");
      const projectId = lookup(row, "cdb_projectid");
      if (!materialId || !projectIds.has(projectId)) continue;
      const projectIdsForMaterial = projectCountByMaterial.get(materialId) ?? new Set<string>();
      projectIdsForMaterial.add(projectId);
      projectCountByMaterial.set(materialId, projectIdsForMaterial);
    }

    const normalizedCategories = categoryRows
      .map((row) => ({ id: id(row, "cdb_materialcategoryid"), name: text(row, "cdb_name") }))
      .filter((category) => category.id && category.name)
      .sort((a, b) => a.name.localeCompare(b.name, "en"));
    const categoryNoById = new Map(normalizedCategories.map((category, index) => [category.id, index + 1]));
    const categoryNameById = new Map(normalizedCategories.map((category) => [category.id, category.name]));
    const uncategorizedNo = normalizedCategories.length + 1;
    const middleCategories = normalizedCategories.map((category, index) => ({
      no: index + 1,
      name: category.name,
      enabled: true,
    }));
    middleCategories.push({ no: uncategorizedNo, name: "Uncategorized", enabled: true });

    const sortedMaterials = [...materialRows].sort((a, b) =>
      text(a, "cdb_materialname", "cdb_materialcode", "cdb_code").localeCompare(
        text(b, "cdb_materialname", "cdb_materialcode", "cdb_code"),
        "en",
      ),
    );
    const unitIdByNo = new Map<number, string>();
    const yearKeys = [...new Set(prices.map((price) => price.year))].sort((a, b) => {
      if (a === "current") return 1;
      if (b === "current") return -1;
      return Number(a) - Number(b);
    });
    if (!yearKeys.length) yearKeys.push("current");

    const items: CostItem[] = sortedMaterials.map((row, index) => {
      const no = index + 1;
      const materialId = id(row, "cdb_materialid");
      const categoryId = lookup(row, "cdb_materialcategoryid");
      const unitId = lookup(row, "cdb_unitid");
      unitIdByNo.set(no, unitId);

      const itemPrices = prices.filter(
        (price) =>
          price.materialId === materialId &&
          (!unitId || !price.unitId || price.unitId === unitId),
      );
      const pricesByYearVendor = aggregatePrices(itemPrices);
      const yearPrices: CostItem["yearPrices"] = {};
      for (const yearKey of yearKeys) {
        const vendorPrices: Partial<Record<LocationKey, number>> = {};
        for (const [key, amount] of pricesByYearVendor) {
          const [priceMaterialId, priceYear, vendorId] = key.split("|");
          if (priceMaterialId === materialId && priceYear === yearKey) vendorPrices[vendorId] = amount;
        }
        yearPrices[yearKey] = vendorPrices;
      }

      const costnaviHistory: CostItem["costnaviHistory"] = {};
      for (const yearKey of yearKeys) {
        const yearValues = Object.values(yearPrices[yearKey] ?? {}).filter(
          (amount): amount is number => amount !== undefined,
        );
        const yearAverage = average(yearValues);
        if (yearAverage !== null) costnaviHistory[yearKey] = yearAverage;
      }

      const latestPrices = yearPrices[yearKeys[yearKeys.length - 1]] ?? {};
      const baseAverage = average(
        Object.values(latestPrices).filter((amount): amount is number => amount !== undefined),
      );
      const projectCount = projectCountByMaterial.get(materialId)?.size ?? 0;
      const note = [
        text(row, "cdb_specification", "cdb_description"),
        projectCount ? `Used in ${projectCount} active project${projectCount === 1 ? "" : "s"}` : "",
      ]
        .filter(Boolean)
        .join(" | ");

      return {
        id: materialId,
        no,
        daiNo: "1",
        chuNo: categoryNoById.get(categoryId) ?? uncategorizedNo,
        chuName: categoryNameById.get(categoryId) ?? "Uncategorized",
        name: text(row, "cdb_materialname", "cdb_materialcode", "cdb_code") || `Material ${no}`,
        note,
        unit: unitNames.get(unitId) || "-",
        costnavi: baseAverage,
        prices: latestPrices,
        yearPrices,
        costnaviHistory,
      };
    });

    const locationRows = [...vendorRowsById].map(([vendorId, row]) => ({
      key: vendorId,
      label: text(row, "cdb_name") || "Vendor",
      pref: [text(row, "cdb_city"), text(row, "cdb_prefecture")].filter(Boolean).join(", "),
      registered: prices.some((price) => price.vendorId === vendorId),
    }));
    const years = yearKeys.map((key) => ({
      key,
      label: key === "current" ? "Current" : `FY${key}`,
      factor: 1,
    }));

    return {
      masters: {
        majorCategories: [{ no: "1", name: "Materials", enabled: true }],
        middleCategories,
        locations: locationRows,
        prefectures: PREFECTURES,
        years,
        trendYears: yearKeys,
        suppliers: [],
      },
      items,
      prices,
      unitIdByNo,
      vendorNameById,
    };
  }

  async loadMasters(): Promise<CostDbMasters> {
    return (await this.loadSnapshot()).masters;
  }

  async listItems(query: ItemQuery = {}): Promise<CostItem[]> {
    const { items } = await this.loadSnapshot();
    const filtered = items.filter((item) => {
      if (query.daiNo && item.daiNo !== query.daiNo) return false;
      if (query.chuNo !== undefined && item.chuNo !== query.chuNo) return false;
      if (!query.keyword) return true;
      const keyword = query.keyword.toLocaleLowerCase();
      return [item.name, item.note, item.chuName, String(item.no)].some((value) =>
        value.toLocaleLowerCase().includes(keyword),
      );
    });
    return query.top ? filtered.slice(0, query.top) : filtered;
  }

  async listPriceHistory(no: number, vendorId: LocationKey): Promise<PriceHistoryEntry[]> {
    const snapshot = await this.loadSnapshot();
    const item = snapshot.items.find((entry) => entry.no === no);
    if (!item?.id) return [];

    const yearlyPrices = new Map<YearKey, number[]>();
    for (const price of snapshot.prices) {
      if (price.materialId !== item.id || price.vendorId !== vendorId) continue;
      const unitId = snapshot.unitIdByNo.get(no);
      if (unitId && price.unitId && price.unitId !== unitId) continue;
      const amounts = yearlyPrices.get(price.year) ?? [];
      amounts.push(price.amount);
      yearlyPrices.set(price.year, amounts);
    }

    const prices = Object.fromEntries(
      [...yearlyPrices].map(([year, amounts]) => [year, average(amounts) ?? 0]),
    );
    return Object.keys(prices).length ? [{ locationKey: vendorId, no, prices }] : [];
  }

  async listOrderHistory(no: number, vendorId: LocationKey): Promise<OrderHistoryEntry[]> {
    const snapshot = await this.loadSnapshot();
    const item = snapshot.items.find((entry) => entry.no === no);
    if (!item?.id) return [];

    const latestByVendor = new Map<string, PriceRecord>();
    const itemUnitId = snapshot.unitIdByNo.get(no);
    for (const price of snapshot.prices) {
      if (price.materialId !== item.id || !price.vendorId) continue;
      if (itemUnitId && price.unitId && price.unitId !== itemUnitId) continue;
      const existing = latestByVendor.get(price.vendorId);
      if (!existing || Number(price.year) > Number(existing.year)) latestByVendor.set(price.vendorId, price);
    }

    const orders = [...latestByVendor].map(([supplierId, price]) => ({
      project: "Price record",
      supplier: snapshot.vendorNameById.get(supplierId) ?? "Vendor",
      price: price.amount,
    }));
    if (!orders.length) return [];

    return [{
      locationKey: vendorId,
      no,
      standard: average(orders.map((order) => order.price)) ?? 0,
      orders,
    }];
  }
}