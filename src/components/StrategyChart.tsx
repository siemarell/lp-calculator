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
  Legend,
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
  Legend,
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
      pointRadius: 1.5,
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
          plugins: {
            legend: {
              display: true,
              position: "top",
              labels: {
                usePointStyle: true,
                boxWidth: 10,
                padding: 20,
                font: {
                  size: 12,
                },
              },
              onClick: (e, legendItem, legend) => {
                const index = legendItem.datasetIndex;
                if (index !== undefined) {
                  // Toggle the visibility of the dataset
                  const meta = chartInstance.current?.getDatasetMeta(index);
                  if (meta) {
                    // Toggle visibility
                    meta.hidden = !meta.hidden;
                    // Update the chart
                    legend.chart.update();
                  }
                }
              },
            },
            tooltip: {
              enabled: true,
              callbacks: {
                label: function (context) {
                  let label = context.dataset.label || "";
                  if (label) {
                    label += ": ";
                  }
                  if (context.parsed.y !== null) {
                    label += new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(context.parsed.y);
                  }
                  return label;
                },
              },
            },
          },
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: "Price",
                font: {
                  size: 14,
                  weight: "bold",
                },
              },
              // ticks: {
              //   callback: function (value, index, values) {
              //     return "$" + value;
              //   },
              // },
            },
            y: {
              title: {
                display: true,
                text: "Profit",
                font: {
                  size: 14,
                  weight: "bold",
                },
              },
              ticks: {
                callback: function (value, index, values) {
                  return "$" + value;
                },
              },
            },
          },
        },
      };
      chartInstance.current = new Chart(ctx, config);
    } else {
      // Update existing chart data while preserving visibility state
      const chart = chartInstance.current;

      // Store current visibility states
      const hiddenStates = chart.data.datasets.map((_, index) => {
        const meta = chart.getDatasetMeta(index);
        return meta.hidden;
      });

      // Update data
      chart.data.labels = prices;
      chart.data.datasets = datasets;
      // Only set title text if the title plugin exists
      if (chart.options.plugins?.title) {
        chart.options.plugins.title.text = name;
      }

      // Restore visibility states (if number of datasets matches)
      if (hiddenStates.length === datasets.length) {
        hiddenStates.forEach((hidden, index) => {
          const meta = chart.getDatasetMeta(index);
          meta.hidden = hidden;
        });
      }

      chart.update();
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
    <div className={cn("h-[400px]", props.className)}>
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
