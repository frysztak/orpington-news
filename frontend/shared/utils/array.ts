export const shuffleArray = <T>(arr: Array<T>): Array<T> =>
  arr
    .map((a: T): [number, T] => [Math.random(), a])
    .sort((a, b) => a[0] - b[0])
    .map((a) => a[1]);

export function notEmpty<TValue>(
  value: TValue | null | undefined
): value is TValue {
  return value !== null && value !== undefined;
}

/**
 * Generates [0, 1, 2, 3, ... n - 1] array.
 * @param n - number of elements
 */
export function genN(n: number): number[] {
  return Array.from(Array(n).keys());
}

const emptyArray: any[] = [];

/**
 * If `array` is undefined, returns referentially stable empty array. Otherwise, returns `array`.
 */
export function emptyIfUndefined<T>(array: T[] | undefined): T[] {
  return array === undefined ? (emptyArray as T[]) : array;
}
