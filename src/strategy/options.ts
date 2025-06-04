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
  @observable accessor expirationDays: number;
  @observable accessor enabled: boolean = true;

  constructor(
    optionType: OptionType,
    position: PositionType,
    quantity: number,
    strike_price: number,
    premium_per_item: number,
    expirationDays: number = 30,
  ) {
    this.id = `option-${id++}`;
    this.optionType = optionType;
    this.position = position;
    this.quantity = quantity;
    this.strike_price = strike_price;
    this.premium_per_item = premium_per_item;
    this.expirationDays = expirationDays;
  }

  // Equivalent to Python's property
  get label(): string {
    return `${this.optionType} ${this.position} ${this.quantity} @ ${this.strike_price}. $${this.total_premium} (${this.expirationDays}d)`;
  }

  // Equivalent to Python's property
  get total_premium(): number {
    return this.quantity * this.premium_per_item;
  }

  // Calculate Black-Scholes implied volatility based on option price
  private calculateTimeValue(daysRemaining: number): number {
    if (daysRemaining <= 0) return 0;
    // Simple linear time decay for now
    return daysRemaining / this.expirationDays;
  }

  // Equivalent to Python's method with type annotation
  payoff(prices: number[], daysRemaining?: number): number[] {
    const timeValue = this.calculateTimeValue(daysRemaining ?? this.expirationDays);
    const result: number[] = [];

    for (let i = 0; i < prices.length; i++) {
      const price = prices[i];
      let intrinsicValue: number;

      if (this.optionType === OptionType.CALL) {
        intrinsicValue = Math.max(price - this.strike_price, 0) * this.quantity;
      } else if (this.optionType === OptionType.PUT) {
        intrinsicValue = Math.max(this.strike_price - price, 0) * this.quantity;
      } else {
        throw new Error("Invalid option type");
      }

      // For expired options (timeValue = 0), only intrinsic value remains
      // For active options, we interpolate between current price and expiration
      const timeAdjustedPremium = this.total_premium * timeValue;

      if (this.position === PositionType.BUY) {
        result[i] = intrinsicValue - timeAdjustedPremium;
      } else if (this.position === PositionType.SELL) {
        result[i] = -intrinsicValue + timeAdjustedPremium;
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
        expirationDays: this.expirationDays,
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
      data.data.expirationDays,
    );
    position.enabled = data.data.enabled ?? true;
    return position;
  }
}
