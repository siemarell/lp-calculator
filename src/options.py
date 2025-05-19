from dataclasses import dataclass
from enum import Enum

import numpy as np


class OptionType(Enum):
    CALL = "call"
    PUT = "put"


class PositionType(Enum):
    BUY = "buy"
    SELL = "sell"


@dataclass
class OptionPosition:
    type: OptionType  # OptionType Enum
    position: PositionType  # PositionType Enum

    quantity: float
    strike_price: float  # Strike price
    premium_per_item: float  # Premium paid (if BUY) or received (if SELL)

    @property
    def label(self):
        return f"{self.type.value} {self.position.value} {self.quantity} @ {self.strike_price}"

    @property
    def total_premium(self):
        return self.quantity * self.premium_per_item

    def payoff(self, price: float | np.ndarray):
        """
        Calculate the payoff for a single option leg.
        S: array of underlying prices at expiration
        """
        if self.type == OptionType.CALL:
            payoff = np.maximum(price - self.strike_price, 0) * self.quantity
        elif self.type == OptionType.PUT:
            payoff = np.maximum(self.strike_price - price, 0) * self.quantity
        else:
            raise ValueError("Invalid option type")

        if self.position == PositionType.BUY:
            return payoff - self.total_premium
        elif self.position == PositionType.SELL:
            return -payoff + self.total_premium
        else:
            raise ValueError("Invalid position type")
