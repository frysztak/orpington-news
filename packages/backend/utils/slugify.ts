import * as s from 'slugify';

export const slugify = (str: string): string =>
  s.default(str, {
    lower: true,
  });
