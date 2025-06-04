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
import { computed } from "mobx";
import { UniswapV3Position } from "src/strategy/uniswap_v3";

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
  const configBuilder = new ConfigBuilder(props.strategy);
  const series = configBuilder.series;
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
              type: "linear",
              title: {
                display: true,
                text: "Price",
                font: {
                  size: 14,
                  weight: "bold",
                },
              },
            },
            y: {
              type: "linear",
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
class ConfigBuilder {
  constructor(private strategy: Strategy) {}

  @computed
  get series() {
    const prices = this.strategy.prices;

    // Initialize total payoff array with zeros
    const total_payoff = new Array(prices.length).fill(0);
    let static_payoff = 0;

    // Data for the plot
    const series = [];

    for (const position of this.strategy.positions) {
      if (position instanceof UniswapV3Position) {
        // Calculate impermanent loss
        const il = position.impermanent_loss(prices) as number[];

        // Add impermanent loss line
        series.push({
          x: prices,
          y: il,
          line: { dash: "dash" },
          name: position.label,
        });

        // Calculate and add collected fees
        const collected_fees = position.getFeesInToken1(
          this.strategy.daysInPosition,
        );
        if (collected_fees) {
          series.push({
            x: [prices[0], prices[prices.length - 1]],
            y: [collected_fees, collected_fees],
            line: { color: "blue", dash: "dot" },
            name: `Collected Fees: $${collected_fees.toFixed(2)}`,
          });

          static_payoff += collected_fees;
          // Add collected fees to total payoff
          for (let i = 0; i < total_payoff.length; i++) {
            total_payoff[i] += collected_fees;
            total_payoff[i] += il[i];
          }
        }
      } else {
        // Handle OptionPosition
        const position_values = position.payoff(prices) as number[];

        // Add position values to total payoff
        for (let i = 0; i < total_payoff.length; i++) {
          total_payoff[i] += position_values[i];
        }

        static_payoff -= position.total_premium;

        // Add option position line
        series.push({
          x: prices,
          y: position_values,
          line: { dash: "dash" },
          name: position.label,
        });
      }
    }

    // Add static payoff line
    series.push({
      x: [prices[0], prices[prices.length - 1]],
      y: [static_payoff, static_payoff],
      line: { color: "green", dash: "dot" },
      name: `Fees - Premium: ${static_payoff.toFixed(2)}`,
    });

    // Add total strategy line
    series.push({
      x: prices,
      y: total_payoff,
      line: { color: "black", width: 2 },
      name: "Total Strategy",
    });

    return series;
  }
}
