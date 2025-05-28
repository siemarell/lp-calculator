import matplotlib.pyplot as plt
import numpy as np

from matplotlib.ticker import MaxNLocator

from src.options import OptionPosition
from src.uniswap_v3 import UniswapV3Position


class Strategy:
    def __init__(self, name: str, positions: list[UniswapV3Position | OptionPosition]):
        self.name = name
        self.positions = positions

    def plot(self, prices: np.ndarray, days: int | None = None) -> None:
        assert days is None or days > 0, "days must be positive"
        plt.figure(figsize=(12, 8))
        total_payoff = np.zeros_like(prices)
        intersection_prices = []
        static_payoff = 0
        for position in self.positions:
            if isinstance(position, UniswapV3Position):
                plt.axvspan(
                    position.p_l,
                    position.p_u,
                    color="green",
                    alpha=0.1,
                    label=f"Range {position.p_l} - {position.p_u}",
                )
                plt.axvline(
                    x=position.token0_price_in_token1,
                    color="red",
                    linestyle=":",
                    label="Current Price",
                )
                il = position.impermanent_loss(prices)

                lower_drawn = False
                upper_drawn = False
                for i, price in enumerate(prices):
                    if not lower_drawn and price > position.p_l:
                        lower_drawn = True
                        plt.text(
                            price,
                            il[i],
                            f"${il[i]:.2f}",
                            verticalalignment="bottom",
                        )
                    if not upper_drawn and price > position.p_u:
                        upper_drawn = True
                        plt.text(
                            price,
                            il[i],
                            f"${il[i]:.2f}",
                            verticalalignment="bottom",
                        )

                collected_fees = position.calculate_fees(days)
                intersection_prices.append(position.p_l)
                intersection_prices.append(position.p_u)
                plt.plot(
                    prices,
                    il,
                    linestyle="--",
                    label=position.label,
                )
                if collected_fees:
                    fees_line = plt.axhline(
                        y=collected_fees,
                        color="blue",
                        linestyle=":",
                        label=f"Collected Fees: ${collected_fees:.2f}",
                    )
                    plt.text(
                        plt.xlim()[0],
                        collected_fees,
                        f"{collected_fees:.2f}",
                        verticalalignment="bottom",
                    )
                    static_payoff += collected_fees
                    total_payoff += collected_fees
                    total_payoff += il
            else:
                position_values = position.payoff(prices)
                total_payoff += position_values
                static_payoff -= position.total_premium
                plt.plot(
                    prices,
                    position_values,
                    linestyle="--",
                    label=position.label,
                )

        # plot static payoff
        plt.axhline(
            y=static_payoff,
            color="green",
            linestyle=":",
            label=f"Fees - Premium: {static_payoff:.2f}",
        )
        plt.text(
            plt.xlim()[0],
            static_payoff,
            f"{static_payoff:.2f}",
            verticalalignment="bottom",
        )
        # pool edge total payoffs
        n = 1
        for ip in intersection_prices:
            for i, price in enumerate(prices):
                if price > ip:
                    payoff_at_price = total_payoff[i]
                    # plt.plot(
                    #     price,
                    #     payoff_at_price,
                    #     color="red",
                    #     label=f"Out {n} Payoff ${payoff_at_price:.2f}",
                    # )
                    plt.text(
                        price,
                        payoff_at_price,
                        f"${payoff_at_price:.2f}",
                        verticalalignment="bottom",
                    )
                    n += 1
                    break

        plt.plot(
            prices, total_payoff, color="black", linewidth=2, label="Total Strategy"
        )
        plt.gca().xaxis.set_major_locator(MaxNLocator(nbins=6))
        plt.gca().yaxis.set_major_locator(MaxNLocator(nbins=12))
        plt.xlabel("Price")
        plt.ylabel("Profit / Loss")
        plt.title(self.name)
        plt.grid(True)
        plt.legend()
        plt.show()
