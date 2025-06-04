import { OptionPosition, OptionType, PositionType } from "./options";
import { UniswapV3Position } from "./uniswap_v3";
import { FuturePosition, FutureType } from "./futures";
import { linSpace } from "../utils/linespace";
import { computed, observable } from "mobx";

interface StrategyDTO {
  name: string;
  positions: Array<UniswapV3Position | OptionPosition | FuturePosition>;
  minPrice: number;
  maxPrice: number;
  daysInPosition: number;
}

export class Strategy {
  @observable accessor name: string;
  @observable accessor positions: Array<
    UniswapV3Position | OptionPosition | FuturePosition
  >;
  @observable accessor daysInPosition: number;
  @observable accessor minPrice: number;
  @observable accessor maxPrice: number;
  @observable accessor hiddenSeries: Set<string> = new Set();

  constructor({
    name,
    positions,
    minPrice,
    maxPrice,
    daysInPosition,
    hiddenSeries = new Set(),
  }: StrategyDTO & { hiddenSeries?: Set<string> }) {
    this.name = name;
    this.positions = positions;
    this.minPrice = minPrice;
    this.maxPrice = maxPrice;
    this.daysInPosition = daysInPosition;
    this.hiddenSeries = hiddenSeries;
  }

  @computed
  get prices() {
    return linSpace(this.minPrice, this.maxPrice, 100);
  }

  removePosition(positionId: string) {
    this.positions = this.positions.filter((p) => p.id !== positionId);
  }

  addOptionPosition() {
    const newPosition = new OptionPosition(
      OptionType.CALL,
      PositionType.BUY,
      1.0, // quantity
      this.minPrice + (this.maxPrice - this.minPrice) / 2, // strike at midpoint
      10.0, // premium
      30, // default expiration days
    );
    this.positions.push(newPosition);
  }

  addUniswapV3Position() {
    const midPrice = this.minPrice + (this.maxPrice - this.minPrice) / 2;
    const newPosition = new UniswapV3Position({
      p_l: midPrice * 0.8, // 20% below mid
      p_u: midPrice * 1.2, // 20% above mid
      initialPriceInToken1: midPrice,
      initialPositionValueInToken1: 1000,
      t0Part: 0.5,
      apr: 20,
    });
    this.positions.push(newPosition);
  }

  addFuturePosition() {
    const newPosition = new FuturePosition(FutureType.LONG, 1.0, 50, 20); // type LONG, amount 1.0, price 50 20% margin
    this.positions.push(newPosition);
  }

  toJson() {
    return {
      name: this.name,
      positions: this.positions.map((p) => p.toJson()),
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      daysInPosition: this.daysInPosition,
      savedAt: new Date().toISOString(),
      hiddenSeries: Array.from(this.hiddenSeries),
    };
  }

  static fromJson(data: ReturnType<Strategy["toJson"]>): Strategy {
    const positions = data.positions.map((p: any) => {
      if (p.type === "option") {
        return OptionPosition.fromJson(p);
      } else if (p.type === "uniswap_v3") {
        return UniswapV3Position.fromJson(p);
      } else if (p.type === "future") {
        return FuturePosition.fromJson(p);
      } else {
        throw new Error(`Unknown position type: ${p.type}`);
      }
    });

    const strategy = new Strategy({
      name: data.name,
      positions,
      minPrice: data.minPrice,
      maxPrice: data.maxPrice,
      daysInPosition: data.daysInPosition,
      hiddenSeries: new Set(data.hiddenSeries || []),
    });

    return strategy;
  }
}
