// Equivalent to Python's enum
import { computed, observable } from "mobx";

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
  @observable accessor autoRoll: boolean;
  @observable accessor autoRollDays: number;

  // Additional parameters for better pricing
  @observable accessor spotPrice: number; // Spot price when position was created
  @observable accessor riskFreeRate: number = 0.0;

  constructor(
    optionType: OptionType,
    position: PositionType,
    quantity: number,
    strike_price: number,
    premium_per_item: number,
    purchaseSpotPrice: number,
    expirationDays: number,
    autoRoll = false,
    autoRollDays = 0,
  ) {
    this.id = `option-${id++}`;
    this.optionType = optionType;
    this.position = position;
    this.quantity = quantity;
    this.strike_price = strike_price;
    this.premium_per_item = premium_per_item;
    this.spotPrice = purchaseSpotPrice;
    this.expirationDays = expirationDays;
    this.autoRoll = autoRoll;
    this.autoRollDays = autoRollDays;
  }
  @computed get IV(): number {
    return this.calculateImpliedVolatility(
      this.spotPrice,
      this.strike_price,
      this.expirationDays / 365,
      this.premium_per_item,
    );
  }
  get label(): string {
    return `${this.optionType} ${this.position} ${this.quantity} @ ${this.strike_price}. $${this.total_premium} (${this.expirationDays}d)`;
  }

  get total_premium(): number {
    return this.quantity * this.premium_per_item;
  }

  private calculateImpliedVolatility(
    S: number,
    K: number,
    T: number,

    marketPrice: number,
    maxIter = 100,
    tol = 1e-5,
  ): number {
    let sigma = 0.5; // initial guess
    for (let i = 0; i < maxIter; i++) {
      const price = this.calculateBlackScholesPrice(S, T, sigma);

      const vega =
        (S *
          Math.sqrt(T) *
          Math.exp(
            -0.5 *
              ((Math.log(S / K) + (this.riskFreeRate + sigma ** 2 / 2) * T) /
                (sigma * Math.sqrt(T))) **
                2,
          )) /
        Math.sqrt(2 * Math.PI);

      const diff = price - marketPrice;
      if (Math.abs(diff) < tol) return sigma;

      sigma -= diff / vega;
      if (sigma <= 0) sigma = tol; // prevent non-positive volatility
    }

    return 0; // failed to converge;
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
    sigma: number,
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
    const sigma = this.IV;

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
    const sigma = this.IV;

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

  // Calculate theoretical premium at purchase to verify pricing
  get theoreticalPremiumAtPurchase(): number {
    const purchaseTimeToExpiry = this.expirationDays / 365;
    return this.calculateBlackScholesPrice(
      this.spotPrice,
      purchaseTimeToExpiry,
      this.IV,
    );
  }

  // Improved payoff calculation with proper reference point
  payoff(prices: number[], daysInPosition: number = 0): number[] {
    return prices.map((price) => this.calculatePnL(price, daysInPosition));
  }

  // Calculate P&L at a specific spot price and time
  calculatePnL(spotPrice: number, daysInPosition: number = 0): number {
    const daysToExpiry = Math.max(this.expirationDays - daysInPosition, 0);
    const timeToExpiry = daysToExpiry / 365;

    let currentOptionValue: number;

    if (timeToExpiry <= 0) {
      // At expiration, use intrinsic value
      if (this.optionType === OptionType.CALL) {
        currentOptionValue = Math.max(spotPrice - this.strike_price, 0);
      } else {
        currentOptionValue = Math.max(this.strike_price - spotPrice, 0);
      }
    } else {
      currentOptionValue = this.calculateBlackScholesPrice(
        spotPrice,
        timeToExpiry,
        this.IV,
      );
    }

    // Calculate P&L based on position type
    if (this.position === PositionType.BUY) {
      return (currentOptionValue - this.premium_per_item) * this.quantity;
    } else {
      return (this.premium_per_item - currentOptionValue) * this.quantity;
    }
  }

  // Get Greeks for analysis
  getGreeks(
    spotPrice: number,
    daysInPosition: number = 0,
  ): {
    delta: number;
    theta: number;
    gamma?: number;
    vega?: number;
  } {
    const daysToExpiry = Math.max(this.expirationDays - daysInPosition, 0);
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

  // Helper method to check if pricing is consistent
  get pricingConsistency(): {
    theoreticalPremium: number;
    actualPremium: number;
    difference: number;
    percentageDifference: number;
  } {
    const theoretical = this.theoreticalPremiumAtPurchase;
    const actual = this.premium_per_item;
    const difference = actual - theoretical;
    const percentageDifference =
      theoretical !== 0 ? (difference / theoretical) * 100 : 0;

    return {
      theoreticalPremium: theoretical,
      actualPremium: actual,
      difference,
      percentageDifference,
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
        purchaseSpotPrice: this.spotPrice,
        expirationDays: this.expirationDays,
        impliedVolatility: this.IV,
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
      data.data.purchaseSpotPrice,
      data.data.expirationDays,
    );
    position.enabled = data.data.enabled ?? true;
    return position;
  }
}
