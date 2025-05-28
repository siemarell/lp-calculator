import * as math from 'mathjs';
import { OptionPosition, OptionType, PositionType } from './src/options';
import { Strategy } from './src/strategy';
import { UniswapV3Position } from './src/uniswap_v3';

// Create a linear space array (equivalent to numpy.linspace)
function linspace(start: number, stop: number, num: number): number[] {
  const step = (stop - start) / (num - 1);
  return Array.from({ length: num }, (_, i) => start + step * i);
}

// Define strategies
const diman_5000_bucks_30d_strategy = new Strategy(
  "Diman ETH-USDC $5000. 0%/100%. 30d, Put Hedge",
  [
    new OptionPosition(
      OptionType.PUT,
      PositionType.BUY,
      2.2,
      1900,
      24
    ),
    new UniswapV3Position(1650, 3371)
      .provide_liquidity(2500, 5000, 0)
      .set_expected_daily_profit_per_1000_token1(0.8)
  ]
);

const usdc_eth_unichain_my_may24_strategy = new Strategy(
  "My ETH-USDC $1600, 70%/30%, 30d Call Hedge",
  [
    new OptionPosition(
      OptionType.CALL,
      PositionType.BUY,
      0.5,
      3200,
      55.9
    ),
    new UniswapV3Position(2360, 3600)
      .provide_liquidity(2520, 1600, 0.78)
      .set_expected_daily_profit_per_1000_token1(1.0)
  ]
);

const usdc_eth_hedge_half_eth_strategy = new Strategy(
  "ETH-USDC $2500, 100%/0%, 30d, Hedge 1/2",
  [
    new OptionPosition(
      OptionType.CALL,
      PositionType.BUY,
      0.5,
      3200,
      49.9
    ),
    new UniswapV3Position(2360, 3600)
      .provide_liquidity(2500, 2500, 0.78)
      .set_expected_daily_profit_per_1000_token1(1.0)
  ]
);

// Create a linear space of prices from 1500 to 4000 with 1000 points
const prices = linspace(1500, 4000, 1000);

// Functions to plot each strategy
function plotStrategy1(): void {
  usdc_eth_unichain_my_may24_strategy.plot(prices, 30);
}

function plotStrategy2(): void {
  diman_5000_bucks_30d_strategy.plot(prices, 30);
}

function plotStrategy3(): void {
  usdc_eth_hedge_half_eth_strategy.plot(prices, 30);
}

// Expose plotting functions to the window object for use in the HTML file
declare global {
  interface Window {
    plotStrategy1: () => void;
    plotStrategy2: () => void;
    plotStrategy3: () => void;
  }
}

window.plotStrategy1 = plotStrategy1;
window.plotStrategy2 = plotStrategy2;
window.plotStrategy3 = plotStrategy3;

// Main function to run when the script is executed directly
function main(): void {
  plotStrategy1();
}

// Run the main function when the script is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  main();
}
