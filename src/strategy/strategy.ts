import { OptionPosition, OptionType, PositionType } from "./options";
import { UniswapV3Position } from "./uniswap_v3";
import { FuturePosition, FutureType } from "./futures";
import { linSpace } from "../utils/linespace";
import { autorun, computed, observable, reaction, runInAction } from "mobx";
import { assertNever } from "src/utils/assertNever";
import Disposable from "src/utils/Disposable";

interface StrategyDTO {
  name: string;
  positions: Array<UniswapV3Position | OptionPosition | FuturePosition>;
  spotPrice: number;
  daysInPosition: number;
}

export class Strategy extends Disposable {
  @observable accessor name: string;
  @observable accessor positions: Array<
    UniswapV3Position | OptionPosition | FuturePosition
  >;
  @observable accessor daysInPosition: number;
  @observable accessor spotPrice: number;
  @observable accessor priceRangePercent: number = 70;
  @computed get minPrice() {
    return this.spotPrice - this.spotPrice * (this.priceRangePercent / 100);
  }
  @computed get maxPrice() {
    return this.spotPrice + this.spotPrice * (this.priceRangePercent / 100);
  }
  @observable accessor hiddenSeries: Set<string> = new Set();

  constructor({
    name,
    positions,
    spotPrice,
    daysInPosition,
    hiddenSeries = new Set(),
  }: StrategyDTO & { hiddenSeries?: Set<string> }) {
    super();
    this.name = name;
    this.positions = positions;
    this.spotPrice = spotPrice;
    this.daysInPosition = daysInPosition;
    this.hiddenSeries = hiddenSeries;

    this.addDisposer(
      reaction(
        () => this.spotPrice,
        () => {
          console.log("spot price changed");
          this.positions.forEach((p) => {
            switch (p.type) {
              case "future":
                p.entryPrice = this.spotPrice;
                break;
              case "option":
                p.spotPrice = this.spotPrice;
                break;
              case "uniswap_v3":
                p.initialPriceInToken1 = this.spotPrice;
                break;
              default:
                assertNever(p);
            }
          });
        },
      ),
    );
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
      this.spotPrice * 1.2, // strike at 20% above spot price
      10.0, // premium
      this.spotPrice,
      30, // default expiration days
    );
    this.positions = [...this.positions, newPosition];
  }

  addUniswapV3Position() {
    const newPosition = new UniswapV3Position({
      p_l: this.spotPrice * 0.8, // 20% below mid
      p_u: this.spotPrice * 1.2, // 20% above mid
      initialPriceInToken1: this.spotPrice,
      initialPositionValueInToken1: 1000,
      t0Part: 0.5,
      apr: 20,
    });
    this.positions = [...this.positions, newPosition];
  }

  addFuturePosition() {
    const newPosition = new FuturePosition(
      FutureType.LONG,
      1.0,
      this.spotPrice,
      20,
    ); // type LONG, amount 1.0, price 50 20% margin
    this.positions = [...this.positions, newPosition];
  }

  toJson() {
    return {
      name: this.name,
      positions: this.positions.map((p) => p.toJson()),
      spotPrice: this.spotPrice,
      daysInPosition: this.daysInPosition,
      savedAt: new Date().toISOString(),
      hiddenSeries: Array.from(this.hiddenSeries),
    };
  }

  static fromJson(data: ReturnType<Strategy["toJson"]>): Strategy {
    const positions = data.positions.map((p) => {
      if (p.type === "option") {
        return OptionPosition.fromJson(p);
      } else if (p.type === "uniswap_v3") {
        return UniswapV3Position.fromJson(p);
      } else if (p.type === "future") {
        return FuturePosition.fromJson(p);
      } else {
        assertNever(p);
      }
    });

    return new Strategy({
      name: data.name,
      positions,
      spotPrice: data.spotPrice || 0,
      daysInPosition: data.daysInPosition,
      hiddenSeries: new Set(data.hiddenSeries || []),
    });
  }
}
