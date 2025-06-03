import { OptionPosition, OptionType, PositionType } from "./options";
import { UniswapV3Position } from "./uniswap_v3";
import { linSpace } from "../utils/linespace";
import { computed, observable } from "mobx";

interface Series {
  x: number[];
  y: number[];
  name: string;
  line?: { color?: string; dash?: string; width?: number };
  fillcolor?: string;
  opacity?: number;
}
interface StrategyDTO {
  name: string;
  positions: Array<UniswapV3Position | OptionPosition>;
  minPrice: number;
  maxPrice: number;
  daysInPosition: number;
}
export class Strategy {
  @observable accessor name: string;
  @observable accessor positions: Array<UniswapV3Position | OptionPosition>;
  @observable accessor prices: number[] = [];
  @observable accessor daysInPosition: number;
  constructor({
    name,
    positions,
    minPrice,
    maxPrice,
    daysInPosition,
  }: StrategyDTO) {
    this.name = name;
    this.positions = positions;
    this.prices = linSpace(minPrice, maxPrice, 100);
    this.daysInPosition = daysInPosition;
  }
  @computed
  get series(): Series[] {
    const prices = this.prices;

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

        series.push({
          x: [
            position.initialPriceInToken1,
            position.initialPositionValueInToken1,
          ],
          y: [-Infinity, Infinity],
          line: { color: "red", dash: "dot" },
          name: "Current Price",
        });

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
        const collected_fees = position.getFeesInToken1(this.daysInPosition);
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

export const usdc_eth_unichain_my_may24_strategy = new Strategy({
  name: "My ETH-USDC $1600, 70%/30%, 30d Call Hedge",
  positions: [
    new OptionPosition(OptionType.CALL, PositionType.BUY, 0.5, 3200, 55.9),
    new UniswapV3Position({
      p_l: 2360,
      p_u: 3600,
      initialPriceInToken1: 2520,
      initialPositionValueInToken1: 1600,
      t0Part: 0.78,
      apr: 40,
    }),
  ],
  minPrice: 1500,
  maxPrice: 3600,
  daysInPosition: 30,
});
