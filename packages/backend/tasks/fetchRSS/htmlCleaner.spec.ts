import { parse } from 'node-html-parser';
import { fixImageSrc } from './htmlCleaner';

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
});
