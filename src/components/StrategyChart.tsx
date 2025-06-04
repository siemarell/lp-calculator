import cn from "classnames";
import { ChartConfiguration, ChartOptions, Plugin } from "chart.js/auto";
import { useEffect, useRef } from "react";
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Strategy } from "../strategy/strategy";
import { observer } from "mobx-react-lite";
import { UniswapV3Position } from "src/strategy/uniswap_v3";

// Type definitions for annotations
interface RectangleAnnotation {
  type: "rectangle";
  x0: number;
  x1: number;
  fillColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

interface HorizontalLineAnnotation {
  type: "horizontalLine";
  y: number;
  color?: string;
  lineWidth?: number;
  dash?: number[];
}

interface VerticalLineAnnotation {
  type: "verticalLine";
  x: number;
  color?: string;
  lineWidth?: number;
  dash?: number[];
}

type Annotation =
  | RectangleAnnotation
  | HorizontalLineAnnotation
  | VerticalLineAnnotation;

// Extend ChartOptions to include annotations
interface ExtendedChartOptions extends ChartOptions<"line"> {
  annotations?: Annotation[];
}

// Extend ChartConfiguration to use our extended options
interface ExtendedChartConfiguration
  extends Omit<ChartConfiguration<"line">, "options"> {
  options?: ExtendedChartOptions;
}

// Type for series data
interface SeriesData {
  name: string;
  y: number[];
  color?: string;
  width?: number;
  dash?: number[];
}

// Type for chart data result
interface ChartDataResult {
  series: SeriesData[];
  annotations: Annotation[];
}

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

// Chart.js plugin for drawing annotations
const annotationPlugin: Plugin<"line"> = {
  id: "customAnnotations",
  beforeDraw: (chart) => {
    const ctx = chart.ctx;
    const chartArea = chart.chartArea;
    const xScale = chart.scales.x;
    const yScale = chart.scales.y;

    if (!ctx || !chartArea || !xScale || !yScale) return;

    const options = chart.config.options as ExtendedChartOptions;
    const annotations = options.annotations || [];

    ctx.save();

    annotations.forEach((annotation: Annotation) => {
      switch (annotation.type) {
        case "rectangle": {
          // Draw price range rectangle
          const x1 = xScale.getPixelForValue(annotation.x0);
          const x2 = xScale.getPixelForValue(annotation.x1);
          const y1 = chartArea.top;
          const y2 = chartArea.bottom;

          ctx.fillStyle = annotation.fillColor || "rgba(0, 255, 0, 0.1)";
          ctx.fillRect(x1, y1, x2 - x1, y2 - y1);

          // Optional: Draw border
          if (annotation.borderColor) {
            ctx.strokeStyle = annotation.borderColor;
            ctx.lineWidth = annotation.borderWidth || 1;
            ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
          }
          break;
        }

        case "horizontalLine":
          // Draw horizontal line
          {
            const yPos = yScale.getPixelForValue(annotation.y);

            ctx.strokeStyle = annotation.color || "blue";
            ctx.lineWidth = annotation.lineWidth || 2;

            if (annotation.dash) {
              ctx.setLineDash(annotation.dash);
            }

            ctx.beginPath();
            ctx.moveTo(chartArea.left, yPos);
            ctx.lineTo(chartArea.right, yPos);
            ctx.stroke();

            if (annotation.dash) {
              ctx.setLineDash([]);
            }
          }
          break;

        case "verticalLine": {
          // Draw vertical line
          const xPos = xScale.getPixelForValue(annotation.x);

          ctx.strokeStyle = annotation.color || "red";
          ctx.lineWidth = annotation.lineWidth || 2;

          if (annotation.dash) {
            ctx.setLineDash(annotation.dash);
          }

          ctx.beginPath();
          ctx.moveTo(xPos, chartArea.top);
          ctx.lineTo(xPos, chartArea.bottom);
          ctx.stroke();

          if (annotation.dash) {
            ctx.setLineDash([]);
          }
          break;
        }
      }
    });

    ctx.restore();
  },
};

export const StrategyChart = observer((props: StrategyChartProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const configBuilder = new ConfigBuilder(props.strategy);
  const { series, annotations } = configBuilder.getChartData();
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
      borderColor: s.color || chartColors[index % chartColors.length],
      borderWidth: s.width || 2,
      borderDash: s.dash || [],
      pointRadius: 1.5,
    }));

    if (!chartInstance.current) {
      // Register the plugin
      Chart.register(annotationPlugin);

      // Create chart only once
      const config: ExtendedChartConfiguration = {
        type: "line",
        data: {
          labels: prices,
          datasets,
        },
        options: {
          animation: {
            duration: 0,
          },
          annotations: annotations, // Pass annotations to the plugin
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
                  const meta = chartInstance.current?.getDatasetMeta(index);
                  if (meta) {
                    meta.hidden = !meta.hidden;
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
      const extendedOptions = chart.config.options as ExtendedChartOptions;
      extendedOptions.annotations = annotations;

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
  }, [name, prices, series, annotations]);

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

  getChartData(): ChartDataResult {
    const prices = this.strategy.prices;

    // Initialize total payoff array with zeros
    const total_payoff = new Array(prices.length).fill(0);
    let static_payoff = 0;

    // Data for the plot
    const series: SeriesData[] = [];
    const annotations: Annotation[] = [];

    for (const position of this.strategy.positions) {
      if (position instanceof UniswapV3Position) {
        // Add price range rectangle annotation
        annotations.push({
          type: "rectangle",
          x0: position.p_l,
          x1: position.p_u,
          fillColor: "rgba(0, 255, 0, 0.1)",
          borderColor: "rgba(0, 255, 0, 0.3)",
          borderWidth: 1,
        });

        // Add current price vertical line annotation
        annotations.push({
          type: "verticalLine",
          x: position.initialPriceInToken1,
          color: "red",
          lineWidth: 2,
          dash: [5, 5],
        });

        // Calculate impermanent loss
        const il = position.impermanent_loss(prices) as number[];

        // Add impermanent loss line series
        series.push({
          name: position.label,
          y: il,
          color: chartColors[series.length % chartColors.length],
          dash: [5, 5],
        });

        // Calculate and add collected fees
        const collected_fees = position.getFeesInToken1(
          this.strategy.daysInPosition,
        );
        if (collected_fees) {
          // Add horizontal line annotation for collected fees
          annotations.push({
            type: "horizontalLine",
            y: collected_fees,
            color: "blue",
            lineWidth: 2,
            dash: [10, 5],
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

        // Add option position line series
        series.push({
          name: position.label,
          y: position_values,
          color: chartColors[series.length % chartColors.length],
          dash: [5, 5],
        });
      }
    }

    // Add horizontal line annotation for fees - premium
    annotations.push({
      type: "horizontalLine",
      y: static_payoff,
      color: "green",
      lineWidth: 2,
      dash: [10, 5],
    });

    // Add total strategy line series
    series.push({
      name: "Total Strategy",
      y: total_payoff,
      color: "black",
      width: 3,
    });

    return { series, annotations };
  }
}
