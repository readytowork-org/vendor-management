// Tile 4: vendor price comparison, horizontal bars.

import { useMemo } from "react";
import type { ChartConfiguration, Plugin } from "chart.js";
import { Tile, TileButton } from "./Tile";
import { COLOR, FONT_FAMILY } from "./chartSetup";
import { useChart } from "./useChart";
import { fmtNum, fmtYen } from "../../domain/format";
import { itemLabel, type Pricing } from "../../domain/pricing";
import type { CostDbMasters, CostItem, LocationKey, YearKey } from "../../domain/types";

/** Draws the amount past each bar, in place of an axis. */
const barValueLabels: Plugin<"bar"> = {
  id: "barValueLabels",
  afterDatasetsDraw(chart) {
    const ctx = chart.ctx;
    const meta = chart.getDatasetMeta(0);
    ctx.save();
    ctx.font = `600 10.5px ${FONT_FAMILY}`;
    ctx.fillStyle = COLOR.ink2;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    meta.data.forEach((bar, i) => {
      const v = chart.data.datasets[0].data[i];
      if (v === null || v === undefined) return;
      ctx.fillText(fmtNum(Number(v)), bar.x + 6, bar.y);
    });
    ctx.restore();
  },
};

interface LocationBarTileProps {
  masters: CostDbMasters;
  pricing: Pricing;
  item: CostItem | null;
  /** The selected location is highlighted in solid blue. */
  location: LocationKey;
  year: YearKey;
  onRefresh: () => void;
  onDemoAction: (label: string) => void;
}

export function LocationBarTile({
  masters,
  pricing,
  item,
  location,
  year,
  onRefresh,
  onDemoAction,
}: LocationBarTileProps) {
  const show = Boolean(item);

  const config = useMemo<ChartConfiguration | null>(() => {
    if (!item) return null;

    const labels = ["Overall average", ...masters.locations.map((l) => l.label)];
    const values = [
      pricing.costnaviOf(item, year),
      ...masters.locations.map((l) => pricing.priceOf(item, l.key, year)),
    ];
    const colors = [
      COLOR.orange,
      ...masters.locations.map((l) => (l.key === location ? COLOR.blue : COLOR.blueSoft)),
    ];

    const present = values.filter((v): v is number => v !== null);
    const maxVal = present.length ? Math.max(...present) : 0;

    return {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Unit price",
            data: values,
            backgroundColor: colors,
            borderWidth: 0,
            barThickness: 14,
          },
        ],
      },
      options: {
        indexAxis: "y",
        layout: { padding: { right: 4 } },
        scales: {
          x: { display: false, beginAtZero: true, max: maxVal * 1.24 },
          y: { grid: { display: false }, border: { color: "#d2d0ce" } },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const value: number | null = ctx.parsed.x;
                const base = pricing.costnaviOf(item, year);
                const diff = base && value !== null && ctx.dataIndex > 0 ? value - base : null;
                const lines = [`  ${fmtYen(value)} / ${item.unit}`];
                if (diff !== null && base) {
                  lines.push(
                    `  vs. vendor average: ${diff > 0 ? "+" : ""}${fmtNum(diff)}` +
                      ` (${diff > 0 ? "+" : ""}${((diff / base) * 100).toFixed(1)}%)`,
                  );
                }
                return lines;
              },
            },
          },
        },
      },
      plugins: [barValueLabels],
    };
  }, [item, location, year, masters, pricing]);

  const canvasRef = useChart(config);

  return (
    <Tile
      title="Vendor price comparison"
      span={2}
      actions={
        <>
          <TileButton icon="ic-refresh" title="Refresh" onClick={onRefresh} />
          <TileButton
            icon="ic-more"
            title="More"
            onClick={() => onDemoAction("Vendor price comparison")}
          />
        </>
      }
    >
      <div className="tile-sub">
        {item && (
          <>
            <b>{itemLabel(item)}</b> / {pricing.yearDef(year).label}
          </>
        )}
      </div>
      <div className="chart-box chart-box-bar" hidden={!show}>
        <canvas ref={canvasRef} />
      </div>
      <div className="empty" hidden={show}>
        No matching item found.
      </div>
    </Tile>
  );
}
