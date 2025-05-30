import { OptionPosition, OptionType, PositionType } from "./options";
import { UniswapV3Position } from "./uniswap_v3";
import { linSpace } from "../utils/linespace";

interface Series {
  x: number[];
  y: number[];
  name: string;
  line?: { color?: string; dash?: string; width?: number };
  fillcolor?: string;
  opacity?: number;
}

export class Strategy {
  name: string;
  positions: Array<UniswapV3Position | OptionPosition>;
  prices: number[] = [];
  constructor(
    name: string,
    positions: Array<UniswapV3Position | OptionPosition>,
    minPrice: number,
    maxPrice: number,
  ) {
    this.name = name;
    this.positions = positions;
    this.prices = linSpace(minPrice, maxPrice, 100);
  }

  buildSeries(days: number | null = null): Series[] {
    const prices = this.prices;
    if (days !== null && days <= 0) {
      throw new Error("days must be positive");
    }

    // Initialize total payoff array with zeros
    const total_payoff = new Array(prices.length).fill(0);
    let static_payoff = 0;

    // Data for the plot
    const series: Series[] = [];

    for (const position of this.positions) {
      if (position instanceof UniswapV3Position) {
        // Add range as a rectangle
        // series.push({
        //   type: "rect",
        //   x0: position.p_l,
        //   x1: position.p_u,
        //   y0: -Infinity,
        //   y1: Infinity,
        //   fillcolor: "green",
        //   opacity: 0.1,
        //   name: `Range ${position.p_l} - ${position.p_u}`,
        // });

        // Add current price line
        if (position.token0_price_in_token1) {
          series.push({
            x: [
              position.token0_price_in_token1,
              position.token0_price_in_token1,
            ],
            y: [-Infinity, Infinity],
            line: { color: "red", dash: "dot" },
            name: "Current Price",
          });
        }

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
        const collected_fees = position.calculate_fees(days);
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

export const usdc_eth_unichain_my_may24_strategy = new Strategy(
  "My ETH-USDC $1600, 70%/30%, 30d Call Hedge",
  [
    new OptionPosition(OptionType.CALL, PositionType.BUY, 0.5, 3200, 55.9),
    new UniswapV3Position(2360, 3600)
      .provide_liquidity(2520, 1600, 0.78)
      .set_expected_daily_profit_per_1000_token1(1.0),
  ],
  1500,
  3600,
);
