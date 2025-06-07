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
import { FuturePosition } from "src/strategy/futures";
import { Typography } from "@mui/material";
import { OptionPosition } from "src/strategy/options";
import { assertNever } from "src/utils/assertNever";
import { getDecimalPlaces } from "src/utils/linespace";
import { Switch } from "@mui/material";

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

interface PointAnnotation {
  type: "point";
  x: number;
  y: number;
  color?: string;
  radius?: number;
  label?: string;
}

type Annotation =
  | RectangleAnnotation
  | HorizontalLineAnnotation
  | VerticalLineAnnotation
  | PointAnnotation;

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
  total_fees: number;
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

        case "point": {
          // Draw point
          const xPos = xScale.getPixelForValue(annotation.x);
          const yPos = yScale.getPixelForValue(annotation.y);
          const radius = annotation.radius || 4;

          ctx.fillStyle = annotation.color || "red";
          ctx.beginPath();
          ctx.arc(xPos, yPos, radius, 0, Math.PI * 2);
          ctx.fill();

          // Draw label if provided
          if (annotation.label) {
            ctx.fillStyle = "black";
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.fillText(annotation.label, xPos, yPos - radius - 2);
          }
          break;
        }
      }
    });

    ctx.restore();
  },
};

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

export const StrategyChart = observer((props: StrategyChartProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const configBuilder = new ConfigBuilder(props.strategy);
  const { series, annotations, total_fees } = configBuilder.getChartData();
  const name = props.strategy.name;
  const prices = props.strategy.prices;
  const decimalPlaces = getDecimalPlaces(
    props.strategy.minPrice,
    props.strategy.maxPrice,
  );

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
      backgroundColor: "transparent",
      pointRadius: 1,
      hidden: props.strategy.hiddenSeries.has(s.name),
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
                    // Update strategy's hiddenSeries state
                    const seriesName = series[index].name;
                    if (meta.hidden) {
                      props.strategy.hiddenSeries.add(seriesName);
                    } else {
                      props.strategy.hiddenSeries.delete(seriesName);
                    }
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
              ticks: {
                callback: function (value) {
                  return Number(value).toFixed(decimalPlaces);
                },
              },
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
                  return new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(+value);
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
    <div className={cn("relative h-[400px]", props.className)}>
      <canvas ref={chartRef} className="h-full" />

      <div className="absolute bottom-[-10px] left-0 flex items-center gap-4 py-2">
        <Typography variant="h6">
          Potential Fees: {total_fees.toFixed(2)}
        </Typography>
        <div className="flex items-center gap-2">
          <Typography variant="body2">Include in total</Typography>
          <Switch
            size="small"
            checked={props.strategy.includeFeesInTotal}
            onChange={(e) => {
              props.strategy.includeFeesInTotal = e.target.checked;
            }}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Typography variant="body2">Show 3dChart</Typography>
        <Switch
          size="small"
          checked={props.strategy.show3dChart}
          onChange={(e) => {
            props.strategy.show3dChart = e.target.checked;
          }}
        />
      </div>
    </div>
  );
});

class ConfigBuilder {
  constructor(private strategy: Strategy) {}

  getChartData(): ChartDataResult {
    const prices = this.strategy.prices;

    // Initialize total payoff array with zeros
    const total_payoff = new Array(prices.length).fill(0);
    let total_fees = 0;

    // Data for the plot
    const series: SeriesData[] = [];
    const annotations: Annotation[] = [];

    // Add current price vertical line annotation
    annotations.push({
      type: "verticalLine",
      x: this.strategy.spotPrice,
      color: "red",
      lineWidth: 2,
      dash: [5, 5],
    });

    for (const position of this.strategy.positions) {
      // Skip disabled positions
      if (!position.enabled) continue;

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

        // Calculate impermanent loss
        const il = position.impermanent_loss(prices);
        for (let i = 0; i < total_payoff.length; i++) {
          total_payoff[i] += il[i];
        }
        // Add impermanent loss line series
        const color = chartColors[series.length % chartColors.length];
        series.push({
          name: position.label,
          y: il,
          color: color,
          dash: [5, 5],
        });

        // Add edge points
        const edgeIL = position.ilInToken1OnEdges;
        annotations.push({
          type: "point",
          x: position.p_l,
          y: edgeIL[0],
          color: color,
          radius: 6,
          label: `IL: ${edgeIL[0].toFixed(2)}`,
        });
        annotations.push({
          type: "point",
          x: position.p_u,
          y: edgeIL[1],
          color: color,
          radius: 6,
          label: `IL: ${edgeIL[1].toFixed(2)}`,
        });

        // Calculate and add collected fees
        const collected_fees = position.getFeesInToken1(
          this.strategy.daysInPosition,
        );
        if (collected_fees) {
          total_fees += collected_fees;
          // Add collected fees to total payoff if enabled
          if (this.strategy.includeFeesInTotal) {
            for (let i = 0; i < total_payoff.length; i++) {
              total_payoff[i] += collected_fees;
            }
          }
        }
      } else if (position instanceof FuturePosition) {
        // Handle FuturePosition
        const position_values = position.payoff(prices);

        // Add position values to total payoff
        for (let i = 0; i < total_payoff.length; i++) {
          total_payoff[i] += position_values[i];
        }

        // Add future position line series
        series.push({
          name: position.label,
          y: position_values,
          color: chartColors[series.length % chartColors.length],
          dash: [5, 5],
        });
      } else if (position instanceof OptionPosition) {
        // Handle OptionPosition
        const position_values = position.payoff(
          prices,
          this.strategy.daysInPosition,
        );

        // Add position values to total payoff
        for (let i = 0; i < total_payoff.length; i++) {
          total_payoff[i] += position_values[i];
        }

        // Add option position line series
        series.push({
          name: position.label,
          y: position_values,
          color: chartColors[series.length % chartColors.length],
          dash: [5, 5],
        });
      } else {
        assertNever(position);
      }
    }

    // Add total strategy line series
    series.push({
      name: "Total Strategy",
      y: total_payoff,
      color: "black",
      width: 3,
    });

    // Add zero line annotation
    annotations.push({
      type: "horizontalLine",
      y: 0,
      color: "red",
      lineWidth: 1,
    });

    return { series, annotations, total_fees };
  }
}
