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

  // Additional parameters for better pricing
  @observable accessor currentPrice: number; // Current underlying price when position was created
  @observable accessor impliedVolatility: number = 0.25; // Default 25% IV
  @observable accessor riskFreeRate: number = 0.05; // Default 5% risk-free rate

  constructor(
    optionType: OptionType,
    position: PositionType,
    quantity: number,
    strike_price: number,
    premium_per_item: number,
    currentPrice: number,
    expirationDays: number = 30,
    impliedVolatility: number = 0.25,
    riskFreeRate: number = 0.05,
  ) {
    this.id = `option-${id++}`;
    this.optionType = optionType;
    this.position = position;
    this.quantity = quantity;
    this.strike_price = strike_price;
    this.premium_per_item = premium_per_item;
    this.currentPrice = currentPrice;
    this.expirationDays = expirationDays;
    this.impliedVolatility = impliedVolatility;
    this.riskFreeRate = riskFreeRate;
  }

  get label(): string {
    return `${this.optionType} ${this.position} ${this.quantity} @ ${this.strike_price}. $${this.total_premium} (${this.expirationDays}d)`;
  }

  get total_premium(): number {
    return this.quantity * this.premium_per_item;
  }

  // Normal distribution cumulative density function approximation
  private normalCDF(x: number): number {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2.0);

    const t = 1.0 / (1.0 + p * x);
    const y =
      1.0 -
      ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return 0.5 * (1.0 + sign * y);
  }

  // Calculate Black-Scholes option price
  private calculateBlackScholesPrice(
    spotPrice: number,
    timeToExpiry: number, // in years
  ): number {
    if (timeToExpiry <= 0) {
      // At expiration, option worth only intrinsic value
      if (this.optionType === OptionType.CALL) {
        return Math.max(spotPrice - this.strike_price, 0);
      } else {
        return Math.max(this.strike_price - spotPrice, 0);
      }
    }

    const S = spotPrice;
    const K = this.strike_price;
    const T = timeToExpiry;
    const r = this.riskFreeRate;
    const sigma = this.impliedVolatility;

    const d1 =
      (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) /
      (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);

    if (this.optionType === OptionType.CALL) {
      return S * this.normalCDF(d1) - K * Math.exp(-r * T) * this.normalCDF(d2);
    } else {
      return (
        K * Math.exp(-r * T) * this.normalCDF(-d2) - S * this.normalCDF(-d1)
      );
    }
  }

  // Calculate delta (price sensitivity to underlying movement)
  private calculateDelta(spotPrice: number, timeToExpiry: number): number {
    if (timeToExpiry <= 0) return 0;

    const S = spotPrice;
    const K = this.strike_price;
    const T = timeToExpiry;
    const r = this.riskFreeRate;
    const sigma = this.impliedVolatility;

    const d1 =
      (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) /
      (sigma * Math.sqrt(T));

    if (this.optionType === OptionType.CALL) {
      return this.normalCDF(d1);
    } else {
      return this.normalCDF(d1) - 1;
    }
  }

  // Calculate theta (time decay)
  private calculateTheta(spotPrice: number, timeToExpiry: number): number {
    if (timeToExpiry <= 0) return 0;

    const S = spotPrice;
    const K = this.strike_price;
    const T = timeToExpiry;
    const r = this.riskFreeRate;
    const sigma = this.impliedVolatility;

    const d1 =
      (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) /
      (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);

    const normalPDF = (x: number) =>
      Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);

    if (this.optionType === OptionType.CALL) {
      return (
        ((-S * normalPDF(d1) * sigma) / (2 * Math.sqrt(T)) -
          r * K * Math.exp(-r * T) * this.normalCDF(d2)) /
        365
      ); // Convert to daily theta
    } else {
      return (
        ((-S * normalPDF(d1) * sigma) / (2 * Math.sqrt(T)) +
          r * K * Math.exp(-r * T) * this.normalCDF(-d2)) /
        365
      ); // Convert to daily theta
    }
  }

  // Improved payoff calculation
  payoff(prices: number[], daysInPosition: number = 0): number[] {
    const daysToExpiry = Math.max(this.expirationDays - daysInPosition, 0);
    const timeToExpiry = daysToExpiry / 365; // Convert to years
    const result: number[] = [];

    for (let i = 0; i < prices.length; i++) {
      const spotPrice = prices[i];

      // Calculate current theoretical option price
      const theoreticalPrice = this.calculateBlackScholesPrice(
        spotPrice,
        timeToExpiry,
      );

      // For very short time periods or at expiration, use intrinsic value
      let optionValue: number;
      if (timeToExpiry <= 0.001) {
        // Less than ~4 hours
        if (this.optionType === OptionType.CALL) {
          optionValue = Math.max(spotPrice - this.strike_price, 0);
        } else {
          optionValue = Math.max(this.strike_price - spotPrice, 0);
        }
      } else {
        optionValue = theoreticalPrice;
      }

      // Calculate P&L based on position
      let pnl: number;
      if (this.position === PositionType.BUY) {
        // Long position: current value - premium paid
        pnl = (optionValue - this.premium_per_item) * this.quantity;
      } else {
        // Short position: premium received - current value
        pnl = (this.premium_per_item - optionValue) * this.quantity;
      }

      result[i] = pnl;
    }

    return result;
  }

  // Get Greeks for analysis
  getGreeks(
    spotPrice: number,
    daysRemaining?: number,
  ): {
    delta: number;
    theta: number;
    gamma?: number;
    vega?: number;
  } {
    const daysToExpiry = daysRemaining ?? this.expirationDays;
    const timeToExpiry = daysToExpiry / 365;

    const delta = this.calculateDelta(spotPrice, timeToExpiry);
    const theta = this.calculateTheta(spotPrice, timeToExpiry);

    return {
      delta:
        delta * this.quantity * (this.position === PositionType.BUY ? 1 : -1),
      theta:
        theta * this.quantity * (this.position === PositionType.BUY ? 1 : -1),
    };
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
        currentPrice: this.currentPrice,
        expirationDays: this.expirationDays,
        impliedVolatility: this.impliedVolatility,
        riskFreeRate: this.riskFreeRate,
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
      data.data.currentPrice,
      data.data.expirationDays,
      data.data.impliedVolatility ?? 0.25,
      data.data.riskFreeRate ?? 0.05,
    );
    position.enabled = data.data.enabled ?? true;
    return position;
  }
}
