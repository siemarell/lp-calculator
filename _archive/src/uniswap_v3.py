from typing import Optional

import numpy as np


class UniswapV3Position:
    def __init__(self, p_l: float, p_u: float):
        """
        Pl: lower price (token0 per token1)
        Pu: upper price (token0 per token1)
        """
        if p_l >= p_u:
            raise ValueError("Pl must be less than Pu")
        self.p_l = p_l
        self.p_u = p_u
        self.sqrt_pl = np.sqrt(p_l)
        self.sqrt_pu = np.sqrt(p_u)
        self.deposited_amount0 = None  # Initial amount of token0 provided. Used to calculate impermanent loss
        self.deposited_amount1 = None  # Initial amount of token1 provided. Used to calculate impermanent loss
        self.amount1 = None
        self.L = None  # Liquidity to be calculated
        self.token0_price_in_token1 = None
        self.expected_daily_profit_per_1000_token1 = None
        self.initial_position_value_in_token1 = None

    def provide_liquidity(
        self,
        p_current: float,
        position_value_in_token1: float,
        t0_part: Optional[
            float
        ],  # Initial ratio of tokens provided. Used to calculate impermanent loss. If None, assume distribution that was required by the pool
    ):
        self.token0_price_in_token1 = p_current
        self.initial_position_value_in_token1 = position_value_in_token1
        """Provide liquidity and compute liquidity."""
        if t0_part is not None:
            assert 0 <= t0_part <= 1, "t0_t1_distribution_ratio must be between 0 and 1"
            self.deposited_amount0 = position_value_in_token1 * t0_part / p_current
            self.deposited_amount1 = position_value_in_token1 * (1 - t0_part)
        if p_current <= self.p_l:
            if t0_part is None:
                self.deposited_amount0 = position_value_in_token1 / p_current
            return self._provide_token0_only(position_value_in_token1 / p_current)
        elif p_current >= self.p_u:
            if t0_part is None:
                self.deposited_amount1 = position_value_in_token1
            return self._provide_token1_only(position_value_in_token1)
        else:

            def _get_amounts_by_portion(token0_fraction: float):
                _amount0 = position_value_in_token1 * token0_fraction / p_current
                _amount1 = position_value_in_token1 * (1 - token0_fraction)
                return _amount0, _amount1

            token0_portion = 0.5
            step = 0.5
            amount0, amount1 = _get_amounts_by_portion(token0_portion)
            _, l0, l1 = self._provide_both(
                p_current,
                amount0=amount0,
                amount1=amount1,
            )
            while abs(l1 - l0) > 0.01:
                step = step / 2
                if l1 - l0 > 0:
                    diff = step
                else:
                    diff = -step
                token0_portion += diff
                amount0, amount1 = _get_amounts_by_portion(token0_portion)
                _, l0, l1 = self._provide_both(
                    p_current,
                    amount0=amount0,
                    amount1=amount1,
                )
            if t0_part is None:
                self.deposited_amount0 = amount0
                self.deposited_amount1 = amount1
            return self

    def set_expected_daily_profit_per_1000_token1(
        self,
        daily_profit_per_1000_token1: float | None,
    ):
        self.expected_daily_profit_per_1000_token1 = daily_profit_per_1000_token1
        return self

    def calculate_fees(self, days: int | None):
        if self.expected_daily_profit_per_1000_token1 and days:
            collected_fees = (
                self.expected_daily_profit_per_1000_token1
                * days
                * self.initial_position_value_in_token1
                / 1000
            )
            return collected_fees
        return None

    @property
    def label(self):
        return f"UniV3 IL {self.p_l} {self.p_u}"

    def token_amounts(self, p: float):
        """Given price P and liquidity L, return amounts of token0 and token1."""
        if self.L is None:
            raise ValueError("Liquidity not set. Call a provide_* method first.")

        sqrt_p = np.sqrt(p)
        if p <= self.p_l:
            # Entirely in token0
            amount0 = (
                self.L * (self.sqrt_pu - self.sqrt_pl) / (self.sqrt_pl * self.sqrt_pu)
            )
            amount1 = 0
        elif p >= self.p_u:
            # Entirely in token1
            amount0 = 0
            amount1 = self.L * (self.sqrt_pu - self.sqrt_pl)
        else:
            # Mixed position
            amount0 = self.L * (self.sqrt_pu - sqrt_p) / (sqrt_p * self.sqrt_pu)
            amount1 = self.L * (sqrt_p - self.sqrt_pl)
        return amount0, amount1

    def impermanent_loss(self, p: float | np.ndarray):
        """Given price P and liquidity L, return impermanent loss."""
        if isinstance(p, np.ndarray):
            items = p
        else:
            items = [p]
        result = []
        for item in items:
            if self.L is None:
                raise ValueError("Liquidity not set. Call a provide_* method first.")
            current_amount0, current_amount1 = self.token_amounts(item)
            current_position_value_in_token1 = current_amount0 * item + current_amount1
            deposited_position_amount_in_token1 = (
                self.deposited_amount0 * item + self.deposited_amount1
            )
            result.append(
                current_position_value_in_token1 - deposited_position_amount_in_token1
            )
        return result if len(result) > 1 else result[0]

    def _provide_both(self, p_current: float, amount0: float, amount1: float):
        """Provide both token0 and token1 and compute liquidity."""
        sqrt_p = np.sqrt(p_current)
        L0 = amount0 * sqrt_p * self.sqrt_pu / (self.sqrt_pu - sqrt_p)
        L1 = amount1 / (sqrt_p - self.sqrt_pl)
        self.L = min(L0, L1)
        return self.L, L0, L1

    def _provide_token0_only(self, amount0: float):
        """Provide only token0, compute liquidity."""
        self.L = amount0 * self.sqrt_pl * self.sqrt_pu / (self.sqrt_pu - self.sqrt_pl)
        return self.L

    def _provide_token1_only(self, amount1: float):
        """Provide only token1, compute liquidity."""
        self.L = amount1 / (self.sqrt_pu - self.sqrt_pl)
        return self.L


def _test_uniswap_v3():
    current_price = 2500
    position = UniswapV3Position(1800, 3200)
    position.provide_liquidity(current_price, 5000, t0_part=0)

    print(position.impermanent_loss(1800))
    print(position.impermanent_loss(current_price))
    print(position.impermanent_loss(3200))


if __name__ == "__main__":
    _test_uniswap_v3()
# (x + L / sqrt(p_l)) * (y + L * sqrt(p_u) = L ** 2
# L = sqrt(k)
# p_b = from price, p_a = to price

# x - USDT
# y - WETH

# L = x * (sqrt(P) * sqrt(P_b)) / (sqrt(P_b) - sqrt(P))
# L = y / (sqrt(P) - sqrt(P_a))
