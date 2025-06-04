// Equivalent to Python's enum
import { observable } from "mobx";

export const OptionType = {
  CALL: "Call",
  PUT: "Put",
} as const;
export type OptionType = (typeof OptionType)[keyof typeof OptionType];
export const PositionType = {
  BUY: "Buy",
  SELL: "Sell",
} as const;
export type PositionType = (typeof PositionType)[keyof typeof PositionType];
let id = 0;

export class OptionPosition {
  readonly id: string;
  readonly type = "option" as const;
  @observable accessor optionType: OptionType;
  @observable accessor position: PositionType;
  @observable accessor quantity: number;
  @observable accessor strike_price: number;
  @observable accessor premium_per_item: number;
  @observable accessor enabled: boolean = true;

  constructor(
    optionType: OptionType,
    position: PositionType,
    quantity: number,
    strike_price: number,
    premium_per_item: number,
  ) {
    this.id = `option-${id++}`;
    this.optionType = optionType;
    this.position = position;
    this.quantity = quantity;
    this.strike_price = strike_price;
    this.premium_per_item = premium_per_item;
  }

  // Equivalent to Python's property
  get label(): string {
    return `${this.optionType} ${this.position} ${this.quantity} @ ${this.strike_price}. $${this.total_premium}`;
  }

  // Equivalent to Python's property
  get total_premium(): number {
    return this.quantity * this.premium_per_item;
  }

  // Equivalent to Python's method with type annotation
  payoff(prices: number[]): number[] {
    const result: number[] = [];
    for (let i = 0; i < prices.length; i++) {
      const price = prices[i];
      let payoff: number;
      if (this.optionType === OptionType.CALL) {
        payoff = Math.max(price - this.strike_price, 0) * this.quantity;
      } else if (this.optionType === OptionType.PUT) {
        payoff = Math.max(this.strike_price - price, 0) * this.quantity;
      } else {
        throw new Error("Invalid option type");
      }

      if (this.position === PositionType.BUY) {
        result[i] = payoff - this.total_premium;
      } else if (this.position === PositionType.SELL) {
        result[i] = -payoff + this.total_premium;
      } else {
        throw new Error("Invalid position type");
      }
    }
    return result;
  }

  toJson() {
    return {
      type: this.type,
      data: {
        optionType: this.optionType,
        position: this.position,
        quantity: this.quantity,
        strike_price: this.strike_price,
        premium_per_item: this.premium_per_item,
        enabled: this.enabled,
      },
    };
  }

  static fromJson(data: ReturnType<OptionPosition["toJson"]>): OptionPosition {
    if (data.type !== "option") {
      throw new Error("Invalid position type");
    }
    const position = new OptionPosition(
      data.data.optionType,
      data.data.position,
      data.data.quantity,
      data.data.strike_price,
      data.data.premium_per_item,
    );
    position.enabled = data.data.enabled ?? true;
    return position;
  }
}
