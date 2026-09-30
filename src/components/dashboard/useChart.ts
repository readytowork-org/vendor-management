// Binds a Chart.js instance to the React lifecycle.
// Always memoise config; pass null to destroy the chart.

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import type { ChartConfiguration } from "chart.js";
import "./chartSetup";

export function useChart(config: ChartConfiguration | null) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!config || !canvas) {
      chartRef.current?.destroy();
      chartRef.current = null;
      return;
    }

    if (chartRef.current) {
      chartRef.current.data = config.data;
      chartRef.current.options = config.options ?? {};
      chartRef.current.update();
    } else {
      chartRef.current = new Chart(canvas, config);
    }
  }, [config]);

  // Must destroy on unmount or reusing the canvas throws.
  useEffect(() => {
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, []);

  return canvasRef;
}
