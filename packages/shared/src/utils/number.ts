export const formatCount = (count: number): string =>
  count.toLocaleString('en-US', { useGrouping: true });
