import { OptionPosition, OptionType, PositionType } from "./options";
import { UniswapV3Position } from "./uniswap_v3";
import { linSpace } from "../utils/linespace";
import { observable } from "mobx";

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
  maxPrice: 4000,
  daysInPosition: 30,
});
