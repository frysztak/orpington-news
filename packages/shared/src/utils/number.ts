export const formatCount = (count: number): string =>
  count.toLocaleString('en-US', { useGrouping: true });

export const toStringWithoutExponent = (
  x: number | undefined
): string | undefined => (x !== undefined ? BigInt(x).toString() : undefined);
