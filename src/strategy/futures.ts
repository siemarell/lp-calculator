import { observable } from "mobx";

export const FutureType = {
  LONG: "long",
  SHORT: "short",
} as const;

export type FutureType = (typeof FutureType)[keyof typeof FutureType];

let id = 0;

export class FuturePosition {
  readonly id: string;
  readonly type = "future" as const;
  @observable accessor futureType: FutureType;
  @observable accessor amount: number;
  @observable accessor entryPrice: number;
  @observable accessor margin: number;
  @observable accessor enabled: boolean = true;

  constructor(
    futureType: FutureType,
    amount: number,
    price: number,
    margin: number,
  ) {
    this.id = `future-${id++}`;
    this.futureType = futureType;
    this.amount = amount;
    this.entryPrice = price;
    this.margin = Math.max(0, Math.min(100, margin)); // Ensure margin is between 0 and 100
  }

  get label(): string {
    return `${this.futureType} ${this.amount} @ ${this.margin}% margin`;
  }

  payoff(prices: number[]): number[] {
    const multiplier = this.futureType === FutureType.LONG ? 1 : -1;
    return prices.map(
      (price) => multiplier * this.amount * (price - this.entryPrice),
    );
  }

  toJson() {
    return {
      type: this.type,
      data: {
        futureType: this.futureType,
        amount: this.amount,
        margin: this.margin,
        enabled: this.enabled,
        price: this.entryPrice,
      },
    };
  }

  static fromJson(data: ReturnType<FuturePosition["toJson"]>): FuturePosition {
    if (data.type !== "future") {
      throw new Error("Invalid position type");
    }
    const position = new FuturePosition(
      data.data.futureType,
      data.data.amount,
      data.data.price,
      data.data.margin,
    );
    position.enabled = data.data.enabled ?? true;
    return position;
  }
}
