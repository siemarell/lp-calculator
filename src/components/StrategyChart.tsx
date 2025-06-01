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

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;
    const config: ChartConfiguration<keyof ChartTypeRegistry> = {
      type: "line",
      data: {
        labels: prices,
        datasets: series.map((s) => ({
          label: s.name,
          data: s.y,
          borderColor: s.line?.color || "#000",
          borderDash: s.line?.dash === "dash" ? [5, 5] : [],
          borderWidth: s.line?.width || 1,
          fill: false,
        })),
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: name,
          },
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: "Price",
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: "Payoff",
            },
          },
        },
      },
    };

    chartInstance.current = new Chart(ctx, config);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [name, prices, series]);

  return (
    <div className={cn("", props.className)}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
});
