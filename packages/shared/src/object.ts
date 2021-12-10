import { omit } from 'rambda';

/**
 * Omits object prop if it satisfies `predicate`
 */
export const omitBy =
  (predicate: (propName: string) => boolean) =>
  (obj: object): object => {
    const props = Object.keys(obj).filter(predicate);
    return omit(props)(obj);
  };
