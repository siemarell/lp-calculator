/**
 * Convert a price to a tick using logarithmic formula
 * @param price The price to convert
 * @returns The tick value
 */
export function price_to_tick(price: number): number {
  return Math.log(price) / Math.log(1.0001);
}

/**
 * Calculate the number of ticks between two prices
 * @param p1 The first price
 * @param p2 The second price
 * @returns The absolute number of ticks between the prices
 */
export function ticks_between(p1: number, p2: number): number {
  const t1 = price_to_tick(p1);
  const t2 = price_to_tick(p2);
  return Math.abs(Math.round(t2 - t1));
}
