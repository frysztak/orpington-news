import { TSchema, Type } from '@sinclair/typebox';

export const Nullable = <T extends TSchema>(type: T) =>
  /**
   * Please note that order here is very important (null comes first).
   * I suspect it's because Ajv attempts to parse input string in union sequence (as parsers do).
   * For example for input `null` and for type `Type.Union([Type.Number(), Type.Null()])`
   * it will return `0`, since `null` can be [coerced](https://ajv.js.org/coercion.html) into `0`.
   * But if `null` comes first, it'll remain `null`.
   */
  Type.Union([Type.Null(), type]);
