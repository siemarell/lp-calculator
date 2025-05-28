// Equivalent to Python's enum
export enum OptionType {
  CALL = "Call",
  PUT = "Put",
}

export enum PositionType {
  BUY = "Buy",
  SELL = "Sell",
}

// Equivalent to Python's dataclass
export class OptionPosition {
  type: OptionType;
  position: PositionType;
  quantity: number;
  strike_price: number;
  premium_per_item: number;

  constructor(
    type: OptionType,
    position: PositionType,
    quantity: number,
    strike_price: number,
    premium_per_item: number,
  ) {
    this.type = type;
    this.position = position;
    this.quantity = quantity;
    this.strike_price = strike_price;
    this.premium_per_item = premium_per_item;
  }

  // Equivalent to Python's property
  get label(): string {
    return `${this.type} ${this.position} ${this.quantity} @ ${this.strike_price}. $${this.total_premium}`;
  }

  // Equivalent to Python's property
  get total_premium(): number {
    return this.quantity * this.premium_per_item;
  }

  // Equivalent to Python's method with type annotation
  payoff(price: number | number[]): number | number[] {
    if (Array.isArray(price)) {
      return price.map((p) => this.payoff(p) as number);
    }

    let payoff: number;
    if (this.type === OptionType.CALL) {
      payoff = Math.max(price - this.strike_price, 0) * this.quantity;
    } else if (this.type === OptionType.PUT) {
      payoff = Math.max(this.strike_price - price, 0) * this.quantity;
    } else {
      throw new Error("Invalid option type");
    }

    if (this.position === PositionType.BUY) {
      return payoff - this.total_premium;
    } else if (this.position === PositionType.SELL) {
      return -payoff + this.total_premium;
    } else {
      throw new Error("Invalid position type");
    }
  }
}
