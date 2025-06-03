import cn from "classnames";
import { ChartConfiguration, ChartTypeRegistry } from "chart.js/auto";
import { useEffect, useRef } from "react";
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  LinearScale,
  Tooltip,
  LineController,
  PointElement,
  LineElement,
} from "chart.js";
import { Strategy } from "../strategy/strategy";
import { observer } from "mobx-react-lite";
Chart.register(
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  Tooltip,
  LineController,
  PointElement,
  LineElement,
);

interface StrategyChartProps {
  className?: string;
  strategy: Strategy;
}

export const StrategyChart = observer((props: StrategyChartProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const series = props.strategy.series;
  const name = props.strategy.name;
  const prices = props.strategy.prices;

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;
    const datasets = series.map((s, index) => ({
      label: s.name,
      data: s.y,
      fill: false,
      borderColor:
        index === series.length - 1
          ? "black"
          : chartColors[index % chartColors.length],
      pointRadius: 1,
    }));
    if (!chartInstance.current) {
      // Create chart only once
      const config: ChartConfiguration<keyof ChartTypeRegistry> = {
        type: "line",
        data: {
          labels: prices,
          datasets,
        },
        options: {
          animation: {
            duration: 0,
          },
          /* your options here, unchanged */
        },
      };
      chartInstance.current = new Chart(ctx, config);
    } else {
      // Update existing chart data
      chartInstance.current.data.labels = prices;
      chartInstance.current.data.datasets = datasets;
      chartInstance.current.options.plugins!.title!.text = name;

      chartInstance.current.update();
    }

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [name, prices, series]);

  return (
    <div className={cn("", props.className)}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
});

const chartColors = [
  "#3B82F6", // Bright Blue
  "#EF4444", // Vibrant Red
  "#10B981", // Emerald Green
  "#F59E0B", // Amber Orange
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#84CC16", // Lime Green
  "#EC4899", // Pink
  "#6B7280", // Cool Gray
];
