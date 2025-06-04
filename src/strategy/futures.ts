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
  @observable accessor margin: number;
  @observable accessor enabled: boolean = true;

  constructor(futureType: FutureType, amount: number, margin: number) {
    this.id = `future-${id++}`;
    this.futureType = futureType;
    this.amount = amount;
    this.margin = Math.max(0, Math.min(100, margin)); // Ensure margin is between 0 and 100
  }

  get label(): string {
    return `${this.futureType} ${this.amount} @ ${this.margin}% margin`;
  }

  payoff(price: number | number[]): number | number[] {
    if (!this.enabled) return Array.isArray(price) ? price.map(() => 0) : 0;

    if (Array.isArray(price)) {
      return price.map((p) => this.payoff(p) as number);
    }

    const multiplier = this.futureType === FutureType.LONG ? 1 : -1;
    return multiplier * this.amount * (price - 1); // Assuming entry price is 1
  }

  toJson() {
    return {
      type: this.type,
      data: {
        futureType: this.futureType,
        amount: this.amount,
        margin: this.margin,
      },
    };
  }

  static fromJson(data: ReturnType<FuturePosition["toJson"]>): FuturePosition {
    if (data.type !== "future") {
      throw new Error("Invalid position type");
    }
    return new FuturePosition(
      data.data.futureType,
      data.data.amount,
      data.data.margin,
    );
  }
}
