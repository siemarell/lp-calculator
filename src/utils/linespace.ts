// Create a linear space array (equivalent to numpy.linspace)
export function linSpace(start: number, stop: number, num: number): number[] {
  const decimalPlaces = getDecimalPlaces(start, stop);
  const step = (stop - start) / (num - 1);
  return Array.from(
    { length: num },
    (_, i) =>
      Math.round((start + step * i) * Math.pow(10, decimalPlaces)) /
      Math.pow(10, decimalPlaces),
  );
}

// Function to determine decimal places based on price range
export function getDecimalPlaces(minPrice: number, maxPrice: number): number {
  const range = maxPrice - minPrice;
  if (range > 1000) return 0;
  if (range > 100) return 1;
  if (range > 10) return 2;
  return 3;
}
