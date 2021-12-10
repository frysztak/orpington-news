export const isTruthy = (a: unknown) => Boolean(a);
export const nonNull = <T>(a: T | null): a is T => a !== null;
