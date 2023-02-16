import { z } from 'zod';

export const ID = z.number();
export type ID = z.infer<typeof ID>;
