import math


def price_to_tick(price):
    return math.log(price) / math.log(1.0001)


def ticks_between(p1, p2):
    t1 = price_to_tick(p1)
    t2 = price_to_tick(p2)
    return abs(int(round(t2 - t1)))
