// Tile 3: vendor price coverage, doughnut plus legend.

import { useMemo } from "react";
import type { ChartConfiguration } from "chart.js";
import { Tile, TileButton } from "./Tile";
import { COLOR } from "./chartSetup";
import { useChart } from "./useChart";
import { fmtYen } from "../../domain/format";
import { itemLabel, supplierRowsFromOrders, type Pricing } from "../../domain/pricing";
import type { CostItem, LocationKey, OrderHistoryEntry, YearKey } from "../../domain/types";

const SLICE_COLORS = [COLOR.blue, COLOR.orange, COLOR.yellow, COLOR.purple, COLOR.gray];

interface SupplierPieTileProps {
  pricing: Pricing;
  item: CostItem | null;
  location: LocationKey;
  year: YearKey;
  /** Rows from the order history table for this item and location. */
  orderHistory: OrderHistoryEntry | null;
  onRefresh: () => void;
  onDemoAction: (label: string) => void;
}

export function SupplierPieTile({
  pricing,
  item,
  location,
  year,
  orderHistory,
  onRefresh,
  onDemoAction,
}: SupplierPieTileProps) {
  const loc = pricing.locationDef(location);

  // Real order rows win; the supplier master estimate is the fallback for
  // items that have no order history yet.
  const recorded = useMemo(() => supplierRowsFromOrders(orderHistory), [orderHistory]);

  const rows = useMemo(() => {
    if (recorded.length) return recorded;
    return item && loc ? pricing.supplierRows(item, loc.key, year) : [];
  }, [recorded, item, loc, year, pricing]);

  const show = rows.length > 0;
  const emptyMessage = !item ? "No matching material found." : "No vendor price records found for this material.";

  const config = useMemo<ChartConfiguration | null>(() => {
    if (!item || !rows.length) return null;
    return {
      type: "doughnut",
      data: {
        labels: rows.map((r) => r.name),
        datasets: [
          {
            data: rows.map((r) => r.share),
            backgroundColor: rows.map((_, i) => SLICE_COLORS[i % SLICE_COLORS.length]),
            borderColor: "#fff",
            borderWidth: 2,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        cutout: "52%",
        layout: { padding: 4 },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (ctx) => String(ctx[0].label),
              label: (ctx) => {
                const r = rows[ctx.dataIndex];
                return [
                  `  Vendor record share: ${r.share.toFixed(1)}%`,
                  `  Listed unit price: ${fmtYen(r.price)} / ${item.unit}`,
                ];
              },
            },
          },
        },
      },
    };
  }, [item, rows]);

  const canvasRef = useChart(config);

  return (
    <Tile
      title="Vendor price coverage"
      span={2}
      actions={
        <>
          <TileButton icon="ic-refresh" title="Refresh" onClick={onRefresh} />
          <TileButton
            icon="ic-more"
            title="More"
            onClick={() => onDemoAction("Vendor price coverage")}
          />
        </>
      }
    >
      <div className="tile-sub">
        {show && item && loc && (
          <>
            <b>{itemLabel(item)}</b>
            {!recorded.length && " (no order history: estimated values)"}
          </>
        )}
      </div>
      <div className="chart-box chart-box-pie" hidden={!show}>
        <canvas ref={canvasRef} />
      </div>
      <ul className="legend">
        {rows.map((r, i) => (
          <li key={r.name}>
            <span
              className="sw"
              style={{ background: SLICE_COLORS[i % SLICE_COLORS.length] }}
            />
            <span className="nm">{r.name}</span>
            <span className="sh">{r.share.toFixed(1)}%</span>
            <span className="pr">{fmtYen(r.price)}</span>
          </li>
        ))}
      </ul>
      <div className="empty" hidden={show}>
        {emptyMessage}
      </div>
    </Tile>
  );
}
