from typing import Union

from src.options import OptionPosition
from src.uniswap_v3 import UniswapV3Position


def calculate_total_position_at_price(
    price: float,
    positions: list[Union[OptionPosition, UniswapV3Position]],
):
    total_position = 0
    for position in positions:
        match position:
            case OptionPosition():
                total_position += position.payoff(price)
            case UniswapV3Position():
                total_position += position.impermanent_loss(price)
    return total_position
