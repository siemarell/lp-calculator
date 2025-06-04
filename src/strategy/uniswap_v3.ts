import { action, computed, observable } from "mobx";
type CreateUniswapV3Position = {
  p_l: number;
  p_u: number;
  initialPriceInToken1: number;
  initialPositionValueInToken1: number;
  t0Part: number;
  apr: number;
};

let id = 0;
export class UniswapV3Position {
  readonly id: string;
  readonly type = "uniswap_v3" as const;
  @observable accessor p_l: number;
  @observable accessor p_u: number;
  @observable accessor initialPriceInToken1: number;
  @observable accessor initialPositionValueInToken1: number;
  @observable accessor apr: number;
  @observable accessor enabled: boolean = true;

  @computed get initialTokenAmounts(): [number, number] {
    return this.token_amounts(this.initialPriceInToken1);
  }

  @computed get ilInToken1OnEdges() {
    return this.impermanent_loss([this.p_l, this.p_u]);
  }

  @computed get combinedWeightedLossAtEdges() {
    return this.ilInToken1OnEdges.reduce((a, b) => a + b, 0);
  }
  getFeesInToken1(daysInPosition: number) {
    return (
      this.initialPositionValueInToken1 *
      (this.apr / 100) *
      (daysInPosition / 365)
    );
  }
  get label(): string {
    return `UniV3 IL ${this.p_l} ${this.p_u}`;
  }

  @observable accessor isCustomTokenDistribution: boolean = false;
  @action.bound setCustomTokenDistribution(t0Part: number) {
    this.t0Part = t0Part;
  }
  @observable accessor t0Part: number = 0.5;

  constructor({
    p_u,
    p_l,
    initialPositionValueInToken1,
    t0Part,
    initialPriceInToken1,
    apr,
  }: CreateUniswapV3Position) {
    /**
     * Pl: lower price (token0 per token1)
     * Pu: upper price (token0 per token1)
     */
    if (p_l >= p_u) {
      throw new Error("Pl must be less than Pu");
    }
    this.id = `uniswap_v3_${id++}`;
    this.p_l = p_l;
    this.p_u = p_u;
    this.initialPositionValueInToken1 = initialPositionValueInToken1;
    this.t0Part = t0Part;
    this.initialPriceInToken1 = initialPriceInToken1;
    this.apr = apr;
  }

  @computed private get sqrt_pl() {
    return Math.sqrt(this.p_l);
  }
  @computed private get sqrt_pu() {
    return Math.sqrt(this.p_u);
  }

  @computed private get amountsAndLiquidityForPosition() {
    if (this.initialPriceInToken1 <= this.p_l) {
      return this._provide_token0_only(
        this.initialPositionValueInToken1 / this.initialPriceInToken1,
      );
    } else if (this.initialPriceInToken1 >= this.p_u) {
      return this._provide_token1_only(this.initialPositionValueInToken1);
    } else {
      const _get_amounts_by_portion = (
        token0_fraction: number,
      ): [number, number] => {
        const _amount0 =
          (this.initialPositionValueInToken1 * token0_fraction) /
          this.initialPriceInToken1;
        const _amount1 =
          this.initialPositionValueInToken1 * (1 - token0_fraction);
        return [_amount0, _amount1];
      };

      let token0_portion = 0.5;
      let step = 0.5;
      let [amount0, amount1] = _get_amounts_by_portion(token0_portion);
      let [l0, l1] = this._provide_both(
        this.initialPriceInToken1,
        amount0,
        amount1,
      );

      while (Math.abs(l1 - l0) > 0.01) {
        step = step / 2;
        const diff = l1 - l0 > 0 ? step : -step;
        token0_portion += diff;
        [amount0, amount1] = _get_amounts_by_portion(token0_portion);
        [l0, l1] = this._provide_both(
          this.initialPriceInToken1,
          amount0,
          amount1,
        );
      }
      return { liquidity: l1, amount1, amount0 };
    }
  }

  private token_amounts(p: number): [number, number] {
    /**
     * Given price P and liquidity L, return amounts of token0 and token1.
     */

    const sqrt_p = Math.sqrt(p);
    let amount0: number;
    let amount1: number;

    if (p <= this.p_l) {
      // Entirely in token0
      amount0 =
        (this.L * (this.sqrt_pu - this.sqrt_pl)) /
        (this.sqrt_pl * this.sqrt_pu);
      amount1 = 0;
    } else if (p >= this.p_u) {
      // Entirely in token1
      amount0 = 0;
      amount1 = this.L * (this.sqrt_pu - this.sqrt_pl);
    } else {
      // Mixed position
      amount0 = (this.L * (this.sqrt_pu - sqrt_p)) / (sqrt_p * this.sqrt_pu);
      amount1 = this.L * (sqrt_p - this.sqrt_pl);
    }
    return [amount0, amount1];
  }

  impermanent_loss(prices: number[]): number[] {
    /**
     * Given price P and liquidity L, return impermanent loss.
     */
    const result: number[] = [];

    for (const item of prices) {
      if (this.L === null) {
        throw new Error("Liquidity not set. Call a provide_* method first.");
      }

      if (this.depositedAmount0 === null || this.depositedAmount1 === null) {
        throw new Error("Deposited amounts not set.");
      }

      const [current_amount0, current_amount1] = this.token_amounts(item);
      const current_position_value_in_token1 =
        current_amount0 * item + current_amount1;
      const deposited_position_amount_in_token1 =
        this.depositedAmount0 * item + this.depositedAmount1;

      result.push(
        current_position_value_in_token1 - deposited_position_amount_in_token1,
      );
    }

    return result;
  }

  private _provide_both(p_current: number, amount0: number, amount1: number) {
    /**
     * Provide both token0 and token1 and compute liquidity.
     */
    const sqrt_p = Math.sqrt(p_current);
    const L0 = (amount0 * sqrt_p * this.sqrt_pu) / (this.sqrt_pu - sqrt_p);
    const L1 = amount1 / (sqrt_p - this.sqrt_pl);
    return [L0, L1];
  }

  private _provide_token0_only(amount0: number) {
    /**
     * Provide only token0, compute liquidity.
     */
    return {
      liquidity:
        (amount0 * this.sqrt_pl * this.sqrt_pu) / (this.sqrt_pu - this.sqrt_pl),
      amount0,
      amount1: 0,
    };
  }

  private _provide_token1_only(amount1: number) {
    /**
     * Provide only token1, compute liquidity.
     */
    return {
      liquidity: amount1 / (this.sqrt_pu - this.sqrt_pl),
      amount1,
      amount0: 0,
    };
  }

  @computed private get L() {
    return this.amountsAndLiquidityForPosition.liquidity;
  }

  @computed private get depositedAmount0() {
    if (!this.isCustomTokenDistribution) {
      return this.amountsAndLiquidityForPosition.amount0;
    }
    return (
      (this.initialPositionValueInToken1 * this.t0Part) /
      this.initialPriceInToken1
    );
  }
  @computed private get depositedAmount1() {
    if (!this.isCustomTokenDistribution) {
      return this.amountsAndLiquidityForPosition.amount1;
    }
    return this.initialPositionValueInToken1 * (1 - this.t0Part);
  }

  toJson() {
    return {
      type: this.type,
      data: {
        p_l: this.p_l,
        p_u: this.p_u,
        initialPriceInToken1: this.initialPriceInToken1,
        initialPositionValueInToken1: this.initialPositionValueInToken1,
        t0Part: this.t0Part,
        apr: this.apr,
        enabled: this.enabled,
        isCustomTokenDistribution: this.isCustomTokenDistribution,
      },
    };
  }

  static fromJson(
    data: ReturnType<UniswapV3Position["toJson"]>,
  ): UniswapV3Position {
    if (data.type !== "uniswap_v3") {
      throw new Error("Invalid position type");
    }
    const position = new UniswapV3Position(data.data);
    position.enabled = data.data.enabled ?? true;
    position.isCustomTokenDistribution =
      data.data.isCustomTokenDistribution ?? false;
    return position;
  }
}
