import urlSlug from 'url-slug';

export const slugify = (str: string): string => urlSlug(str);
