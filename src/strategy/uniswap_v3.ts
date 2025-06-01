let id = 0;
export class UniswapV3Position {
  readonly id: string;
  readonly type = "uniswap_v3" as const;
  p_l: number;
  p_u: number;
  sqrt_pl: number;
  sqrt_pu: number;
  deposited_amount0: number | null = null;
  deposited_amount1: number | null = null;
  amount1: number | null = null;
  L: number | null = null;
  token0_price_in_token1: number | null = null;
  expected_daily_profit_per_1000_token1: number | null = null;
  initial_position_value_in_token1: number | null = null;

  constructor(p_l: number, p_u: number) {
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
    this.sqrt_pl = Math.sqrt(p_l);
    this.sqrt_pu = Math.sqrt(p_u);
  }

  provide_liquidity(
    p_current: number,
    position_value_in_token1: number,
    t0_part?: number,
  ): UniswapV3Position {
    /**
     * Provide liquidity and compute liquidity.
     * @param p_current Current price
     * @param position_value_in_token1 Position value in token1
     * @param t0_part Initial ratio of tokens provided. Used to calculate impermanent loss. If undefined, assume distribution that was required by the pool
     */
    this.token0_price_in_token1 = p_current;
    this.initial_position_value_in_token1 = position_value_in_token1;

    if (t0_part !== undefined) {
      if (t0_part < 0 || t0_part > 1) {
        throw new Error("t0_t1_distribution_ratio must be between 0 and 1");
      }
      this.deposited_amount0 = (position_value_in_token1 * t0_part) / p_current;
      this.deposited_amount1 = position_value_in_token1 * (1 - t0_part);
    }

    if (p_current <= this.p_l) {
      if (t0_part === undefined) {
        this.deposited_amount0 = position_value_in_token1 / p_current;
      }
      return this._provide_token0_only(position_value_in_token1 / p_current);
    } else if (p_current >= this.p_u) {
      if (t0_part === undefined) {
        this.deposited_amount1 = position_value_in_token1;
      }
      return this._provide_token1_only(position_value_in_token1);
    } else {
      const _get_amounts_by_portion = (
        token0_fraction: number,
      ): [number, number] => {
        const _amount0 =
          (position_value_in_token1 * token0_fraction) / p_current;
        const _amount1 = position_value_in_token1 * (1 - token0_fraction);
        return [_amount0, _amount1];
      };

      let token0_portion = 0.5;
      let step = 0.5;
      let [amount0, amount1] = _get_amounts_by_portion(token0_portion);
      let [_, l0, l1] = this._provide_both(p_current, amount0, amount1);

      while (Math.abs(l1 - l0) > 0.01) {
        step = step / 2;
        const diff = l1 - l0 > 0 ? step : -step;
        token0_portion += diff;
        [amount0, amount1] = _get_amounts_by_portion(token0_portion);
        [_, l0, l1] = this._provide_both(p_current, amount0, amount1);
      }

      if (t0_part === undefined) {
        this.deposited_amount0 = amount0;
        this.deposited_amount1 = amount1;
      }
      return this;
    }
  }

  set_expected_daily_profit_per_1000_token1(
    daily_profit_per_1000_token1: number | null,
  ): UniswapV3Position {
    this.expected_daily_profit_per_1000_token1 = daily_profit_per_1000_token1;
    return this;
  }

  calculate_fees(days: number | null): number | null {
    if (
      this.expected_daily_profit_per_1000_token1 &&
      days &&
      this.initial_position_value_in_token1
    ) {
      const collected_fees =
        (this.expected_daily_profit_per_1000_token1 *
          days *
          this.initial_position_value_in_token1) /
        1000;
      return collected_fees;
    }
    return null;
  }

  get label(): string {
    return `UniV3 IL ${this.p_l} ${this.p_u}`;
  }

  token_amounts(p: number): [number, number] {
    /**
     * Given price P and liquidity L, return amounts of token0 and token1.
     */
    if (this.L === null) {
      throw new Error("Liquidity not set. Call a provide_* method first.");
    }

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

  impermanent_loss(p: number | number[]): number | number[] {
    /**
     * Given price P and liquidity L, return impermanent loss.
     */
    const items = Array.isArray(p) ? p : [p];
    const result: number[] = [];

    for (const item of items) {
      if (this.L === null) {
        throw new Error("Liquidity not set. Call a provide_* method first.");
      }

      if (this.deposited_amount0 === null || this.deposited_amount1 === null) {
        throw new Error("Deposited amounts not set.");
      }

      const [current_amount0, current_amount1] = this.token_amounts(item);
      const current_position_value_in_token1 =
        current_amount0 * item + current_amount1;
      const deposited_position_amount_in_token1 =
        this.deposited_amount0 * item + this.deposited_amount1;

      result.push(
        current_position_value_in_token1 - deposited_position_amount_in_token1,
      );
    }

    return result.length > 1 ? result : result[0];
  }

  private _provide_both(
    p_current: number,
    amount0: number,
    amount1: number,
  ): [number, number, number] {
    /**
     * Provide both token0 and token1 and compute liquidity.
     */
    const sqrt_p = Math.sqrt(p_current);
    const L0 = (amount0 * sqrt_p * this.sqrt_pu) / (this.sqrt_pu - sqrt_p);
    const L1 = amount1 / (sqrt_p - this.sqrt_pl);
    this.L = Math.min(L0, L1);
    return [this.L, L0, L1];
  }

  private _provide_token0_only(amount0: number): UniswapV3Position {
    /**
     * Provide only token0, compute liquidity.
     */
    this.L =
      (amount0 * this.sqrt_pl * this.sqrt_pu) / (this.sqrt_pu - this.sqrt_pl);
    return this;
  }

  private _provide_token1_only(amount1: number): UniswapV3Position {
    /**
     * Provide only token1, compute liquidity.
     */
    this.L = amount1 / (this.sqrt_pu - this.sqrt_pl);
    return this;
  }
}

// Test function
export function _test_uniswap_v3(): void {
  const current_price = 2500;
  const position = new UniswapV3Position(1800, 3200);
  position.provide_liquidity(current_price, 5000, 0);

  console.log(position.impermanent_loss(1800));
  console.log(position.impermanent_loss(current_price));
  console.log(position.impermanent_loss(3200));
}

// Uncomment to run the test
// if (require.main === module) {
//   _test_uniswap_v3();
// }
