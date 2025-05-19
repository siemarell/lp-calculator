import numpy as np
import matplotlib.pyplot as plt
from matplotlib.ticker import MaxNLocator

from src.options import OptionPosition, OptionType, PositionType
from src.uniswap_v3 import UniswapV3Position


def plot_strategy(
    positions: list[OptionPosition | UniswapV3Position], prices: np.ndarray
) -> None:
    """
    Plot total and individual payoffs of an options strategy.
    S: array of possible stock prices at expiration
    """
    total_payoff = np.zeros_like(prices)

    for position in positions:
        if isinstance(position, UniswapV3Position):
            plt.axvspan(
                position.p_l,
                position.p_u,
                color="green",
                alpha=0.1,
                label="Liquidity Range",
            )
            position_values = position.impermanent_loss(prices)
        else:
            position_values = position.payoff(prices)
        total_payoff += position_values
        plt.plot(
            S,
            position_values,
            linestyle="--",
            label=position.label,
        )

    plt.plot(S, total_payoff, color="black", linewidth=2, label="Total Strategy")
    plt.gca().xaxis.set_major_locator(MaxNLocator(nbins=10))
    plt.gca().yaxis.set_major_locator(MaxNLocator(nbins=10))
    plt.xlabel("Price")
    plt.ylabel("Profit / Loss")
    plt.title("Strategy Payoff")
    plt.grid(True)
    plt.legend()
    plt.show()


def uniswap_v3_impermanent_loss(
    prices: np.ndarray,
    min_price: float,
    max_price: float,
    initial_price: float,
    initial_position_value: float = 4000,
) -> list[float]:
    position = UniswapV3Position(
        p_l=min_price,
        p_u=max_price,
    ).provide_liquidity(initial_price, initial_position_value, t0_part=None)
    result = []
    for price in prices:
        result.append(position.impermanent_loss(price))

    return result


def plot_uniswap_v3_il(
    price_array, min_price, max_price, initial_price, initial_position_value
):
    il = uniswap_v3_impermanent_loss(
        price_array, min_price, max_price, initial_price, initial_position_value
    )

    plt.figure(figsize=(10, 6))
    plt.plot(price_array, il, label="Absolute Impermanent Loss")
    plt.axvline(
        initial_price,
        color="red",
        linestyle="--",
        label=f"Initial Price: {initial_price}",
    )
    plt.axvspan(min_price, max_price, color="green", alpha=0.1, label="Liquidity Range")
    plt.axhline(0, color="gray", linestyle=":")

    plt.xlabel("Token Price")
    plt.ylabel("Loss ($)")
    plt.title("Uniswap V3: Absolute Impermanent Loss vs Token Price")
    plt.legend()
    plt.grid(True)
    plt.show()


# Example usage
if __name__ == "__main__":
    S = np.linspace(1500, 4000, 1000)  # S = Stock prices at expiration

    strategy = [
        # OptionPosition(
        #     strike_price=3000,
        #     type=OptionType.CALL,
        #     position=PositionType.BUY,
        #     premium_per_item=130,
        #     quantity=1,
        # ),
        OptionPosition(
            strike_price=2000,
            type=OptionType.PUT,
            position=PositionType.BUY,
            premium_per_item=88,
            quantity=3,
        ),
        UniswapV3Position(
            p_l=1800,
            p_u=3200,
        ).provide_liquidity(2500, 5000, t0_part=0),
    ]

    plot_strategy(strategy, S)
    # _price_array = np.linspace(1600, 3600, 1000)
    # plot_impermanent_loss_vs_price(
    #     price_array=_price_array, initial_price=2600, position_value=4000
    # )
    # plot_uniswap_v3_il(
    #     min_price=2000,
    #     max_price=3200,
    #     price_array=_price_array,
    #     initial_price=2600,
    #     initial_position_value=4000,
    # )
