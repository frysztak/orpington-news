import { parse } from 'node-html-parser';
import { fixImageSrc, fixRelativeHref } from './htmlCleaner';

describe('HTML Cleaner', () => {
  describe('fixImageSrc', () => {
    const rootUrl = 'https://example.com';

    const runFixImageSrc = (html: string): string => {
      const root = parse(html);
      return fixImageSrc(rootUrl)(root).toString();
    };

    it('does nothing for HTML without img', () => {
      const input = `hello <strong>there</strong>`;
      expect(runFixImageSrc(input)).toBe(input);
    });

    it('does nothing for absolute url', () => {
      const input = `<img src="https://example.com/img.png" >`;
      expect(runFixImageSrc(input)).toBe(input);
    });

    it('turns relative into absolute url', () => {
      const input = `<img src="/static/img.png" >`;
      const expected = `<img src="${rootUrl}/static/img.png">`;
      expect(runFixImageSrc(input)).toBe(expected);
    });
  });

  describe('fixRelativeHref', () => {
    const rootUrl = 'https://example.com';

    const runFixRelativeHref = (html: string): string => {
      const root = parse(html);
      return fixRelativeHref(rootUrl)(root).toString();
    };

    it('does nothing for text', () => {
      const input = `hello <strong>there</strong>`;
      expect(runFixRelativeHref(input)).toBe(input);
    });

    it('does nothing for absolute url', () => {
      const input = `<a href="https://example.com/img.png">link</a>`;
      expect(runFixRelativeHref(input)).toBe(input);
    });

    it('turns relative into absolute url', () => {
      const input = `<a href="/img.png">link</a>`;
      const expected = `<a href="${rootUrl}/img.png">link</a>`;
      expect(runFixRelativeHref(input)).toBe(expected);
    });
  });
});
