export const getString = (x: undefined | unknown): string | undefined =>
  typeof x === 'string' ? x : undefined;

export const getNumber = (x: undefined | unknown): number | undefined =>
  typeof x === 'string' ? +x : undefined;
