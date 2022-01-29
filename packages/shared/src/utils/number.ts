export const formatCount = (count: number): string =>
  count.toLocaleString('en-US', { useGrouping: true });

/**
 * Converts `number` to `string` without exponent introduced by `.toString()` for large numbers.
 */
export const numberToString = (x: number | undefined): string | undefined =>
  x !== undefined ? BigInt(x).toString() : undefined;
