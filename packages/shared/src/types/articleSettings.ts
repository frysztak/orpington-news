export const ArticleWidths = ['narrow', 'wide', 'unlimited'] as const;
export type ArticleWidth = typeof ArticleWidths[number];
export const defaultArticleWidth: ArticleWidth = 'narrow';

export const ArticleFontFamilies = [
  'nunito',
  'ubuntu',
  'lato',
  'openDyslexic',
] as const;
export type ArticleFontFamily = typeof ArticleFontFamilies[number];
export const defaultArticleFontFamily: ArticleFontFamily = 'nunito';
export const ArticleFontFamiliesNames: Record<ArticleFontFamily, string> = {
  nunito: 'Nunito',
  ubuntu: 'Ubuntu',
  lato: 'Lato',
  openDyslexic: 'OpenDyslexic',
};

export const ArticleMonoFontFamilies = [
  'sourceCodePro',
  'ubuntuMono',
  'firaMono',
  'openDyslexicMono',
] as const;
export type ArticleMonoFontFamily = typeof ArticleMonoFontFamilies[number];
export const defaultArticleMonoFontFamily: ArticleMonoFontFamily =
  'sourceCodePro';
export const ArticleMonoFontFamiliesNames: Record<
  ArticleMonoFontFamily,
  string
> = {
  sourceCodePro: 'Source Code Pro',
  openDyslexicMono: 'OpenDyslexic Mono',
  ubuntuMono: 'Ubuntu Mono',
  firaMono: 'Fira Mono',
};

export const ArticleFontSizes = ['sm', 'md', 'lg', 'xl'] as const;
export type ArticleFontSize = typeof ArticleFontSizes[number];
export const defaultArticleFontSize: ArticleFontSize = 'md';
export const ArticleFontSizeValues: Record<ArticleFontSize, number> = {
  sm: 0.75,
  md: 1,
  lg: 1.25,
  xl: 1.5,
};
