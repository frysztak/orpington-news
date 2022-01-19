import isRelativeUrl from 'is-relative-url';
import urlJoin from 'proper-url-join';
import { parse, HTMLElement } from 'node-html-parser';
import { pipe } from 'rambda';

export type Cleaner = (root: HTMLElement) => HTMLElement;

export const fixImageSrc =
  (rootUrl: string): Cleaner =>
  (root) => {
    const imgs = root.getElementsByTagName('img');
    for (const img of imgs) {
      const src = img.getAttribute('src');
      if (src && isRelativeUrl(src)) {
        img.setAttribute('src', urlJoin(rootUrl, src));
      }
    }

    return root;
  };

export const fixRelativeHref =
  (rootUrl: string): Cleaner =>
  (root) => {
    const as = root.getElementsByTagName('a');
    for (const a of as) {
      const href = a.getAttribute('href');
      if (href && isRelativeUrl(href)) {
        a.setAttribute('href', urlJoin(rootUrl, href));
      }
    }

    return root;
  };

export const cleanHTML = (html: string, rootUrl: string): string => {
  const root = parse(html);
  const cleaners = pipe(fixImageSrc(rootUrl), fixRelativeHref(rootUrl));
  return cleaners(root).toString();
};
