// Tile 2: vendor price trend against the average vendor price.

import { useCallback, useMemo } from "react";
import type { ChartConfiguration } from "chart.js";
import { Tile, TileButton } from "./Tile";
import { COLOR } from "./chartSetup";
import { useChart } from "./useChart";
import { fmtNum, fmtYen } from "../../domain/format";
import { itemLabel, type Pricing } from "../../domain/pricing";
import type {
  CostDbMasters,
  CostItem,
  LocationKey,
  PriceHistoryEntry,
} from "../../domain/types";

interface TrendTileProps {
  masters: CostDbMasters;
  pricing: Pricing;
  item: CostItem | null;
  location: LocationKey;
  /** Rows from the price history table for this item and location. */
  priceHistory: PriceHistoryEntry | null;
  onRefresh: () => void;
  onFocusFilter: () => void;
  onDemoAction: (label: string) => void;
}

export function TrendTile({
  masters,
  pricing,
  item,
  location,
  priceHistory,
  onRefresh,
  onFocusFilter,
  onDemoAction,
}: TrendTileProps) {
  const loc = pricing.locationDef(location);
  const show = Boolean(item && loc);

  const emptyMessage = !item
    ? "No matching item found. Please adjust the search criteria."
    : `Vendor "${location.replace(/^pref:/, "")}" has no price data registered.`;

  /**
   * Recorded price for a year, falling back to the revision-rate estimate for
   * years the history table has no row for.
   */
  const priceAt = useCallback(
    (yearKey: string): number | null => {
      if (!item || !loc) return null;
      const recorded = priceHistory?.prices?.[yearKey];
      if (recorded !== undefined && recorded !== null) return recorded;
      return pricing.priceOf(item, loc.key, yearKey);
    },
    [item, loc, priceHistory, pricing],
  );

  /** True when every charted year came from the history table. */
  const isRecorded = useMemo(
    () =>
      Boolean(priceHistory) &&
      masters.trendYears.every((k) => priceHistory?.prices?.[k] !== undefined),
    [masters.trendYears, priceHistory],
  );

  /** Base year versus the year before it, as a percentage. */
  const deltaRate = useMemo(() => {
    if (!item || !loc) return null;
    const baseKey = masters.years.find((y) => y.factor === 1)?.key;
    if (!baseKey) return null;
    const iBase = masters.trendYears.indexOf(baseKey);
    if (iBase <= 0) return null;
    const current = priceAt(baseKey);
    const previous = priceAt(masters.trendYears[iBase - 1]);
    if (current === null || !previous) return null;
    return ((current - previous) / previous) * 100;
  }, [item, loc, masters, priceAt]);

  const config = useMemo<ChartConfiguration | null>(() => {
    if (!item || !loc) return null;

    const labels = masters.trendYears.map((k) => pricing.yearDef(k).label);
    const mine = masters.trendYears.map((k) => priceAt(k));
    const navi = masters.trendYears.map((k) => pricing.costnaviOf(item, k));

    return {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: `${loc.label} price`,
            data: mine,
            borderColor: COLOR.blue,
            backgroundColor: "rgba(0,123,192,.10)",
            pointBackgroundColor: "#fff",
            pointBorderColor: COLOR.blue,
            pointBorderWidth: 1.6,
            pointRadius: 3.5,
            pointHoverRadius: 5,
            borderWidth: 2,
            tension: 0,
            fill: true,
          },
          {
            label: "Average vendor price",
            data: navi,
            borderColor: COLOR.orange,
            backgroundColor: "transparent",
            pointBackgroundColor: "#fff",
            pointBorderColor: COLOR.orange,
            pointBorderWidth: 1.6,
            pointRadius: 3,
            pointHoverRadius: 5,
            borderWidth: 1.8,
            borderDash: [4, 3],
            tension: 0,
            fill: false,
          },
        ],
      },
      options: {
        interaction: { mode: "index", intersect: false },
        layout: { padding: { top: 4, right: 8 } },
        scales: {
          x: { grid: { display: false }, border: { color: "#d2d0ce" } },
          y: {
            grid: { color: COLOR.line },
            border: { display: false },
            ticks: { callback: (v) => fmtNum(Number(v)) },
          },
        },
        plugins: {
          legend: {
            position: "bottom",
            labels: { boxWidth: 10, boxHeight: 10, usePointStyle: false, padding: 12 },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => `  ${ctx.dataset.label}：${fmtYen(ctx.parsed.y)} / ${item.unit}`,
            },
          },
        },
      },
    };
  }, [item, loc, masters, pricing, priceAt]);

  const canvasRef = useChart(config);

  return (
    <Tile
      title="Vendor price trend"
      span={4}
      actions={
        <>
          <TileButton icon="ic-refresh" title="Refresh" onClick={onRefresh} />
          <TileButton icon="ic-filter" title="Filter" onClick={onFocusFilter} />
          <TileButton icon="ic-more" title="More" onClick={() => onDemoAction("Vendor price trend")} />
        </>
      }
    >
      <div className="tile-sub">
        {item && (
          <>
            No.{item.no}
            {" "}
            <b>{itemLabel(item)}</b> ({item.unit})
            {loc && (
              <>
                / Vendor: <b>{loc.label}</b>
              </>
            )}
            {deltaRate !== null && (
              <span className={"delta " + (deltaRate > 0 ? "up" : deltaRate < 0 ? "down" : "")}>
                YoY {deltaRate > 0 ? "+" : ""}
                {deltaRate.toFixed(2)}%
              </span>
            )}
            {show && !isRecorded && " (includes estimated values based on revision rates)"}
          </>
        )}
      </div>
      <div className="chart-box chart-box-lg" hidden={!show}>
        <canvas ref={canvasRef} />
      </div>
      <div className="empty" hidden={show}>
        {emptyMessage}
      </div>
    </Tile>
  );
}
