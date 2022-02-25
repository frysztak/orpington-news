import { equals } from 'rambda';

const ArgsUnset = Symbol();

/**
 * Won't call provided function until arguments change
 * @param func function to be called
 */
export const inhibitUntilArgsChanged = <
  Args extends any[],
  F extends (...args: Args) => any
>(
  func: F
) => {
  let lastArgs: Args | typeof ArgsUnset = ArgsUnset;

  return (...args: Args) => {
    if (lastArgs === ArgsUnset || !equals(args, lastArgs)) {
      func(...args);
      lastArgs = args;
    }
  };
};
