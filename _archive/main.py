import numpy as np

from src.options import OptionPosition, OptionType, PositionType
from src.strategy import Strategy
from src.uniswap_v3 import UniswapV3Position


def main():
    prices = np.linspace(1500, 4000, 1000)
    usdc_eth_unichain_my_may24_strategy.plot(prices, 30)
    # diman_5000_bucks_30d_strategy.plot(prices, 30)
    # usdc_eth_hedge_half_eth_strategy.plot(prices, 30)


diman_5000_bucks_30d_strategy = Strategy(
    name="Diman ETH-USDC $5000. 0%/100%. 30d, Put Hedge",
    positions=[
        OptionPosition(
            strike_price=1900,
            type=OptionType.PUT,
            position=PositionType.BUY,
            premium_per_item=24,
            quantity=2.2,
        ),
        UniswapV3Position(
            p_l=1650,
            p_u=3371,
        )
        .provide_liquidity(2500, 5000, t0_part=0)
        .set_expected_daily_profit_per_1000_token1(0.8),
    ],
)


usdc_eth_unichain_my_may24_strategy = Strategy(
    name="My ETH-USDC $1600, 70%/30%, 30d Call Hedge",
    positions=[
        OptionPosition(
            strike_price=3200,
            type=OptionType.CALL,
            position=PositionType.BUY,
            premium_per_item=55.9,
            quantity=0.5,
        ),
        UniswapV3Position(
            p_l=2360,
            p_u=3600,
        )
        .provide_liquidity(2520, 1600, t0_part=0.78)
        .set_expected_daily_profit_per_1000_token1(1.0),
    ],
)

usdc_eth_hedge_half_eth_strategy = Strategy(
    name="ETH-USDC $2500, 100%/0%, 30d, Hedge 1/2",
    positions=[
        OptionPosition(
            strike_price=3200,
            type=OptionType.CALL,
            position=PositionType.BUY,
            premium_per_item=49.9,
            quantity=0.5,
        ),
        UniswapV3Position(
            p_l=2360,
            p_u=3600,
        )
        .provide_liquidity(2500, 2500, t0_part=0.78)
        .set_expected_daily_profit_per_1000_token1(1.0),
    ],
)
if __name__ == "__main__":
    main()
