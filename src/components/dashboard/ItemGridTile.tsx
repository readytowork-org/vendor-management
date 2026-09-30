// Tile 5: item grid with sorting, filtering and paging.

import type { ReactNode } from "react";
import { Icon } from "../Icon";
import { Tile, TileButton } from "./Tile";
import { fmtNum } from "../../domain/format";
import type { Pricing } from "../../domain/pricing";
import type { CostDbMasters, CostItem, LocationKey, YearKey } from "../../domain/types";

export type SortDir = "asc" | "desc";
/** "no", "name", "note", "unit", or a location key. */
export type SortKey = string;

/** Columns sorted as text; the rest sort as numbers. */
export const TEXT_SORT_KEYS = new Set(["name", "note", "unit"]);

interface Column {
  key: SortKey;
  label: string;
  /** Class applied to the th. */
  className: string;
}

interface ItemGridTileProps {
  masters: CostDbMasters;
  pricing: Pricing;
  /** Every row, already sorted. */
  rows: CostItem[];
  /** Rows on the current page. */
  pageRows: CostItem[];
  /** Category breadcrumb shown above the grid. */
  gridPath: ReactNode;
  gridKeyword: string;
  sortKey: SortKey;
  sortDir: SortDir;
  selectedNo: number | null;
  location: LocationKey;
  year: YearKey;
  page: number;
  pageSize: number;
  onGridKeywordChange: (value: string) => void;
  onSort: (key: SortKey) => void;
  onSelect: (no: number) => void;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  onFocusFilter: () => void;
  onDemoAction: (label: string) => void;
}

export function ItemGridTile({
  masters,
  pricing,
  rows,
  pageRows,
  gridPath,
  gridKeyword,
  sortKey,
  sortDir,
  selectedNo,
  location,
  year,
  page,
  pageSize,
  onGridKeywordChange,
  onSort,
  onSelect,
  onPageChange,
  onRefresh,
  onFocusFilter,
  onDemoAction,
}: ItemGridTileProps) {
  const total = rows.length;
  const maxPage = Math.max(0, Math.ceil(total / pageSize) - 1);
  const start = page * pageSize;

  const columns: Column[] = [
    { key: "no", label: "No.", className: "col-no" },
    { key: "name", label: "Name", className: "col-name" },
    { key: "note", label: "Notes", className: "col-note" },
    { key: "unit", label: "Unit", className: "col-unit" },
    ...masters.locations.map((l) => ({ key: l.key, label: l.label, className: "col-num" })),
  ];

  return (
    <Tile
      title="Item list"
      span={4}
      count={`${total} items`}
      flush
      actions={
        <>
          <TileButton icon="ic-refresh" title="Refresh" onClick={onRefresh} />
          <TileButton icon="ic-filter" title="Filter" onClick={onFocusFilter} />
          <TileButton icon="ic-more" title="More" onClick={() => onDemoAction("Item list")} />
        </>
      }
    >
      <div className="grid-toolbar">
        <span className="grid-path">{gridPath}</span>
        <div className="grid-search">
          <Icon name="ic-search" className="input-ic" />
          <input
            className="input input-with-ic input-sm"
            type="text"
            placeholder="Filter by keyword"
            value={gridKeyword}
            onChange={(e) => onGridKeywordChange(e.target.value)}
          />
        </div>
      </div>

      <div className="grid-scroll">
        <table className="grid">
          <thead>
            <tr>
              {columns.map((col) => {
                const sorted = col.key === sortKey;
                return (
                  <th
                    key={col.key}
                    className={col.className + (sorted ? " is-sorted" : "")}
                    aria-sort={sorted ? (sortDir === "asc" ? "ascending" : "descending") : undefined}
                  >
                    <button type="button" onClick={() => onSort(col.key)}>
                      {col.label}
                      <span className="sort-ic">
                        {sorted && (
                          <Icon
                            name={sortDir === "asc" ? "ic-caret-up" : "ic-caret-down"}
                            size={10}
                          />
                        )}
                      </span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {total === 0 && (
              <tr>
                <td className="no-rows" colSpan={columns.length}>
                  No matching data found. Please adjust your search criteria.
                </td>
              </tr>
            )}
            {pageRows.map((it) => (
              <tr
                key={it.no}
                className={it.no === selectedNo ? "is-selected" : undefined}
                onClick={() => onSelect(it.no)}
              >
                <td className="cell-no">{it.no}</td>
                <td className="cell-name">
                  <span className="row-link">{it.name}</span>
                </td>
                <td className="cell-note" title={it.note}>
                  {it.note || "－"}
                </td>
                <td>{it.unit}</td>
                {masters.locations.map((l) => (
                  <td key={l.key} className={"num" + (l.key === location ? " is-active" : "")}>
                    {fmtNum(pricing.priceOf(it, l.key, year))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid-foot">
        <span className="grid-hint">
          <Icon name="ic-info" size={12} /> Click a row to reflect it in the chart
        </span>
        <span className="grid-pager">
          <span>
            {total ? `${start + 1} - ${Math.min(start + pageSize, total)} / ${total}` : "0 / 0"}
          </span>
          <button
            className="pager-btn"
            type="button"
            title="Previous page"
            aria-label="Previous page"
            disabled={page <= 0}
            onClick={() => onPageChange(page - 1)}
          >
            <Icon name="ic-chevron-left" size={12} />
          </button>
          <button
            className="pager-btn"
            type="button"
            title="Next page"
            aria-label="Next page"
            disabled={page >= maxPage}
            onClick={() => onPageChange(page + 1)}
          >
            <Icon name="ic-chevron-right" size={12} />
          </button>
        </span>
      </div>
    </Tile>
  );
}
