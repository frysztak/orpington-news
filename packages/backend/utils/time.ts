export const timestampMsToSeconds = (
  timestampMs: number | null
): number | null => {
  if (timestampMs === null) return null;
  return Math.floor(timestampMs / 1e3);
};
