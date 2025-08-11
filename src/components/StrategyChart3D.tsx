import { observer } from "mobx-react-lite";
import { Strategy } from "../strategy/strategy";
import cn from "classnames";
import Plot from "react-plotly.js";
import { Typography } from "@mui/material";
import { UniswapV3Position } from "src/strategy/uniswap_v3";

interface StrategyChart3DProps {
  className?: string;
  strategy: Strategy;
}

export const StrategyChart3D = observer((props: StrategyChart3DProps) => {
  const prices = props.strategy.prices;
  const daysInPosition = props.strategy.daysInPosition;

  // Create a grid of points for the 3D surface
  const x = prices;
  const y = Array.from({ length: daysInPosition + 1 }, (_, i) => i);
  let uniLeftEdge = 0;
  let uniRightEdge = 0;
  for (const position of props.strategy.positions) {
    if (!position.enabled) continue;
    if (position instanceof UniswapV3Position) {
      uniLeftEdge = position.p_l;
      uniRightEdge = position.p_u;
    }
  }
  const z = y.map((day) =>
    x.map((price) => {
      // Calculate payoff at each price point and day
      let totalPayoff = 0;
      for (const position of props.strategy.positions) {
        if (!position.enabled) continue;

        totalPayoff += position.payoff([price], day)[0];
      }
      return totalPayoff;
    }),
  );

  return (
    <div className={cn("flex flex-col gap-2", props.className)}>
      <Typography variant="h6" className="text-center">
        3D Strategy Payoff Visualization
      </Typography>
      <div className="relative h-[700px]">
        <Plot
          data={[
            {
              type: "surface",
              x: x,
              y: y,
              z: z,
              colorscale: "Viridis",
              showscale: true,
              // Force Plotly to use all data points
              connectgaps: false,
              // Disable automatic downsampling
              visible: true,
              colorbar: {
                title: {
                  text: "Payoff",
                },

                tickformat: "$,.2f",
              },
              hoverongaps: false,
              hovertemplate:
                "Price: $%{x:.2f}<br>" +
                "Days: %{y}<br>" +
                "Payoff: $%{z:.2f}<extra></extra>",
            },
            // Zero payoff plane
            {
              type: "surface" as const,
              x: [Math.min(...x), Math.max(...x)],
              y: [0, daysInPosition],
              z: [
                [0, 0],
                [0, 0],
              ],
              opacity: 0.3,
              showscale: false,
              hoverongaps: false,
              hovertemplate: "Zero Payoff Plane<extra></extra>",
            },
            // Left edge of Uniswap V3

            {
              type: "surface" as const,
              x: [uniLeftEdge, uniLeftEdge],
              y: [0, daysInPosition],
              z: [
                [Math.min(...z.flat()), Math.max(...z.flat())],
                [Math.min(...z.flat()), Math.max(...z.flat())],
              ],
              opacity: 0.3,
              visible: Boolean(uniLeftEdge),
              showscale: false,
              hoverongaps: false,
              hovertemplate: "Uniswap V3 Left Edge<extra></extra>",
            } as const,

            // Right edge of Uniswap V3

            {
              type: "surface" as const,
              x: [uniRightEdge, uniRightEdge],
              y: [0, daysInPosition],
              z: [
                [Math.min(...z.flat()), Math.max(...z.flat())],
                [Math.min(...z.flat()), Math.max(...z.flat())],
              ],
              visible: Boolean(uniRightEdge),
              opacity: 0.3,
              showscale: false,
              hoverongaps: false,
              hovertemplate: "Uniswap V3 Right Edge<extra></extra>",
            } as const,
          ]}
          layout={{
            title: {
              text: "Strategy Payoff Over Time",
              font: { size: 16 },
            },
            autosize: true,
            scene: {
              xaxis: {
                title: "Price",
                tickformat: "$,.2f",
                gridcolor: "rgb(128, 128, 128)",
                zerolinecolor: "rgb(128, 128, 128)",
                // Ensure all x values are shown
                // range: [Math.min(...x), Math.max(...x)],
                autorange: true,
              },
              yaxis: {
                title: "Days in Position",
                gridcolor: "rgb(128, 128, 128)",
                zerolinecolor: "rgb(128, 128, 128)",
                // Ensure all y values are shown
                // range: [0, daysInPosition],
                autorange: true,
              },
              zaxis: {
                autorange: true,
                title: "Payoff",
                tickformat: "$,.2f",
                gridcolor: "rgb(128, 128, 128)",
                zerolinecolor: "rgb(re)",
              },
              camera: {
                eye: { x: 0.0, y: -1.7, z: 0.0 },
              },
            },
            margin: {
              b: 50,
              t: 50,
              pad: 4,
            },
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
          }}
          config={{
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: ["lasso2d", "select2d"],
            scrollZoom: true,
            // Disable downsampling
            plotGlPixelRatio: 1,
          }}
          style={{ width: "100%", height: "100%" }}
          // Force a re-render when data changes
          // revision={prices.length + daysInPosition}
        />
      </div>
    </div>
  );
});
