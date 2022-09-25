import { z, ZodEffects, ZodNumber, ZodTypeAny } from 'zod';

// copied from https://github.com/airjp73/remix-validated-form/blob/c6a7855af7ef1815e7aceea48e56933d698d3ffe/packages/zod-form-data/src/helpers.ts
// because it wouldn't bundle with webpack
type InputType<DefaultType extends ZodTypeAny> = {
  (): ZodEffects<DefaultType>;
  <ProvidedType extends ZodTypeAny>(
    schema: ProvidedType
  ): ZodEffects<ProvidedType>;
};

const stripEmpty = z.literal('').transform(() => undefined);

const preprocessIfValid = (schema: ZodTypeAny) => (val: unknown) => {
  const result = schema.safeParse(val);
  if (result.success) return result.data;
  return val;
};

/**
 * Coerces numerical strings to numbers transforms empty strings to `undefined` before validating.
 * If you call `zfd.number` with no arguments,
 * it will assume the field is a required number by default.
 * If you want to customize the schema, you can pass that as an argument.
 */
export const numeric: InputType<ZodNumber> = (schema = z.number()) =>
  // @ts-ignore
  z.preprocess(
    preprocessIfValid(
      z.union([
        stripEmpty,
        z
          .string()
          .transform((val) => Number(val))
          .refine((val) => !Number.isNaN(val)),
      ])
    ),
    schema
  );
