// Create a linear space array (equivalent to numpy.linspace)
export function linSpace(start: number, stop: number, num: number): number[] {
  const step = (stop - start) / (num - 1);
  return Array.from({ length: num }, (_, i) => Math.round(start + step * i));
}
