import { extractLanguage } from './extractLanguage';

describe('extractLanguage', () => {
  it('works for `language-xxx` pattern', () => {
    expect(
      extractLanguage({ attribs: { class: 'language-jsx' } } as any)
    ).toEqual('jsx');
  });

  it('works for `gatsby-code-xxx` pattern', () => {
    expect(
      extractLanguage({ attribs: { class: 'gatsby-code-rust' } } as any)
    ).toEqual('rust');
  });

  it('works for language set on `code` tag', () => {
    expect(
      extractLanguage({
        children: [
          { tagName: 'code', attribs: { class: 'hljs language-cpp' } },
        ],
      } as any)
    ).toEqual('cpp');
  });
});
