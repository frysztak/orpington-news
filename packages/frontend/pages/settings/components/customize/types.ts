import {
  ArticleFontFamily,
  ArticleFontSize,
  ArticleMonoFontFamily,
  AvatarStyle,
  CollectionLayout,
} from '@orpington-news/shared';

export const themeOptions = ['dark', 'light'] as const;
export type ThemeOption = typeof themeOptions[number];

export interface CustomizeAppearanceData {
  theme: ThemeOption;
  defaultCollectionLayout: CollectionLayout;
  avatarStyle: AvatarStyle;
  articleFontFamily: ArticleFontFamily;
  articleMonoFontFamily: ArticleMonoFontFamily;
  articleFontSize: ArticleFontSize;
}
