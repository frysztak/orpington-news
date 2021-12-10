export const shuffleArray = <T>(arr: Array<T>): Array<T> =>
  arr
    .map((a: T): [number, T] => [Math.random(), a])
    .sort((a, b) => a[0] - b[0])
    .map((a) => a[1]);
