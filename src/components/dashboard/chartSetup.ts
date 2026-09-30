// Chart.js defaults. Bundled, never loaded from a CDN.

import Chart from "chart.js/auto";

/** Chart palette, matching the brand colours in CSS. */
export const COLOR = {
  blue: "#007bc0",
  orange: "#ea5726",
  yellow: "#f5c24a",
  purple: "#742774",
  gray: "#b0b1b1",
  ink2: "#605e5c",
  line: "#edebe9",
  /** Bars for locations that are not selected. */
  blueSoft: "#b7d9ec",
} as const;

export const FONT_FAMILY =
  '"Segoe UI","Yu Gothic UI","Hiragino Sans","Noto Sans JP",Meiryo,sans-serif';

let applied = false;

export function applyChartDefaults() {
  if (applied) return;
  applied = true;

  Chart.defaults.font.family = FONT_FAMILY;
  Chart.defaults.font.size = 11;
  Chart.defaults.color = COLOR.ink2;
  Chart.defaults.animation = { duration: 240 };
  Chart.defaults.maintainAspectRatio = false;
  Chart.defaults.plugins.tooltip.backgroundColor = "#ffffff";
  Chart.defaults.plugins.tooltip.titleColor = "#323130";
  Chart.defaults.plugins.tooltip.bodyColor = "#323130";
  Chart.defaults.plugins.tooltip.borderColor = "#e1dfdd";
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.displayColors = true;
  Chart.defaults.plugins.tooltip.boxWidth = 9;
  Chart.defaults.plugins.tooltip.boxHeight = 9;
  Chart.defaults.plugins.tooltip.cornerRadius = 2;
}

applyChartDefaults();
