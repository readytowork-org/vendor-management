// Owns the filter state for all five tiles.
// Fetches nothing; masters and items arrive as props.

import { useMemo, useRef, useState } from "react";
import { Icon } from "../Icon";
import { FilterTile } from "./FilterTile";
import { TrendTile } from "./TrendTile";
import { SupplierPieTile } from "./SupplierPieTile";
import { LocationBarTile } from "./LocationBarTile";
import { ItemGridTile, TEXT_SORT_KEYS, type SortDir, type SortKey } from "./ItemGridTile";
import { createPricing, matches } from "../../domain/pricing";
import { useItemHistory } from "../../hooks/useItemHistory";
import type { CostDbMasters, CostItem, LocationKey, YearKey } from "../../domain/types";

const PAGE_SIZE = 15;

/** Charted on load; falls back to the first row. */
const DEFAULT_ITEM_NO = 105;

interface DashboardScreenProps {
  masters: CostDbMasters;
  items: CostItem[];
  onRefresh: () => void;
  onDemoAction: (label: string) => void;
}

export function DashboardScreen({
  masters,
  items,
  onRefresh,
  onDemoAction,
}: DashboardScreenProps) {
  const defaultYear: YearKey = useMemo(
    () => masters.years.find((y) => y.factor === 1)?.key ?? masters.years[0]?.key ?? "",
    [masters],
  );
  const defaultLocation: LocationKey = useMemo(
    () => masters.locations.find((l) => l.registered)?.key ?? masters.locations[0]?.key ?? "",
    [masters],
  );

  const [year, setYear] = useState<YearKey>(defaultYear);
  const [location, setLocation] = useState<LocationKey>(defaultLocation);
  /** Applied keyword; FilterTile holds the draft. */
  const [keyword, setKeyword] = useState("");
  const [gridKeyword, setGridKeyword] = useState("");
  const [selectedNo, setSelectedNo] = useState<number | null>(DEFAULT_ITEM_NO);
  const [sortKey, setSortKey] = useState<SortKey>("no");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(0);

  const keywordInputRef = useRef<HTMLInputElement | null>(null);

  const pricing = useMemo(() => createPricing(masters), [masters]);

  // Filtering.
  const filteredItems = useMemo(
    () => items.filter((it) => matches(it, keyword)),
    [items, keyword],
  );

  // Fall back to row one if the selection is filtered out.
  const effectiveSelectedNo = useMemo(() => {
    if (!filteredItems.length) return null;
    return filteredItems.some((it) => it.no === selectedNo) ? selectedNo : filteredItems[0].no;
  }, [filteredItems, selectedNo]);

  // When a row is selected from the grid, update the selected item.
  const handleSelect = (no: number) => {
    setSelectedNo(no);
  };

  const selectedItem = useMemo(
    () => filteredItems.find((it) => it.no === effectiveSelectedNo) ?? null,
    [filteredItems, effectiveSelectedNo],
  );

  // Price and order history for the charted item, straight from their tables.
  const { priceHistory, orderHistory } = useItemHistory(effectiveSelectedNo, location);

  // Grid rows: tile 1 filter, grid keyword, then sort.
  const sortedRows = useMemo(() => {
    const rows = filteredItems.filter((it) => matches(it, gridKeyword.trim()));
    const dir = sortDir === "asc" ? 1 : -1;

    return [...rows].sort((a, b) => {
      if (TEXT_SORT_KEYS.has(sortKey)) {
        const key = sortKey as "name" | "note" | "unit";
        const c = String(a[key]).localeCompare(String(b[key]), "ja");
        return c !== 0 ? c * dir : a.no - b.no;
      }

      const va = sortKey === "no" ? a.no : (pricing.priceOf(a, sortKey, year) ?? -Infinity);
      const vb = sortKey === "no" ? b.no : (pricing.priceOf(b, sortKey, year) ?? -Infinity);
      if (va < vb) return -dir;
      if (va > vb) return dir;
      return a.no - b.no;
    });
  }, [filteredItems, gridKeyword, sortKey, sortDir, year, pricing]);

  const maxPage = Math.max(0, Math.ceil(sortedRows.length / PAGE_SIZE) - 1);
  const currentPage = Math.min(page, maxPage);
  const pageRows = sortedRows.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);

  // Category breadcrumb above the grid.
  const gridPath = useMemo(() => {
    const first = items[0];
    if (!first) return null;
    const dai = masters.majorCategories.find((c) => c.no === first.daiNo);
    const chu = masters.middleCategories.find((c) => c.no === first.chuNo);
    return (
      <>
        {first.daiNo} {dai?.name}
        <Icon name="ic-chevron-right" size={10} />
        {first.chuNo} {chu?.name}
      </>
    );
  }, [items, masters]);

  // Handlers.
  function focusFilter() {
    keywordInputRef.current?.focus();
    keywordInputRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  function applyKeyword(next: string, nextSelectedNo: number | null) {
    setKeyword(next);
    setSelectedNo(nextSelectedNo);
    setPage(0);
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(TEXT_SORT_KEYS.has(key) ? "asc" : "desc");
    }
    setPage(0);
  }

  function resetFilters() {
    setYear(defaultYear);
    setLocation(defaultLocation);
    setKeyword("");
    setGridKeyword("");
    setSelectedNo(DEFAULT_ITEM_NO);
    setSortKey("no");
    setSortDir("asc");
    setPage(0);
  }

  return (
    <div className="screen">
      <div className="tilegrid">
        <FilterTile
          masters={masters}
          items={items}
          pricing={pricing}
          year={year}
          location={location}
          keyword={keyword}
          matchedCount={filteredItems.length}
          keywordInputRef={keywordInputRef}
          onYearChange={setYear}
          onLocationChange={setLocation}
          onApplyKeyword={applyKeyword}
          onReset={resetFilters}
          onFocusFilter={focusFilter}
          onDemoAction={onDemoAction}
        />

        <TrendTile
          masters={masters}
          pricing={pricing}
          item={selectedItem}
          location={location}
          priceHistory={priceHistory}
          onRefresh={onRefresh}
          onFocusFilter={focusFilter}
          onDemoAction={onDemoAction}
        />

        <SupplierPieTile
          pricing={pricing}
          item={selectedItem}
          location={location}
          year={year}
          orderHistory={orderHistory}
          onRefresh={onRefresh}
          onDemoAction={onDemoAction}
        />

        <LocationBarTile
          masters={masters}
          pricing={pricing}
          item={selectedItem}
          location={location}
          year={year}
          onRefresh={onRefresh}
          onDemoAction={onDemoAction}
        />

        <ItemGridTile
          masters={masters}
          pricing={pricing}
          rows={sortedRows}
          pageRows={pageRows}
          gridPath={gridPath}
          gridKeyword={gridKeyword}
          sortKey={sortKey}
          sortDir={sortDir}
          selectedNo={effectiveSelectedNo}
          location={location}
          year={year}
          page={currentPage}
          pageSize={PAGE_SIZE}
          onGridKeywordChange={(v) => {
            setGridKeyword(v);
            setPage(0);
          }}
          onSort={handleSort}
          onSelect={handleSelect}
          onPageChange={setPage}
          onRefresh={onRefresh}
          onFocusFilter={focusFilter}
          onDemoAction={onDemoAction}
        />
      </div>
    </div>
  );
}
