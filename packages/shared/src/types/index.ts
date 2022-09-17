export type ID = number;

export const CollectionIcons = [
  'Android',
  'Angular',
  'Apple',
  'Archlinux',
  'Chrome',
  'Clojure',
  'Code',
  'CodeBadge',
  'Database',
  'Debian',
  'Deno',
  'Django',
  'Docker',
  'Dotnet',
  'Erlang',
  'Firefox',
  'Fsharp',
  'Git',
  'Github',
  'GNU',
  'Golang',
  'HackerNews',
  'Haskell',
  'HTML',
  'Java',
  'JavaScript',
  'Linux',
  'Markdown',
  'Mozilla',
  'NextJS',
  'NPM',
  'PHP',
  'Python',
  'RaspberryPI',
  'React',
  'Redux',
  'Rust',
  'StackOverflow',
  'Swift',
  'Terminal',
  'TypeScript',
  'Ubuntu',
  'Vim',
  'Wordpress',
] as const;

export type CollectionIconType = typeof CollectionIcons[number];
export const defaultIcon: CollectionIconType = 'Code';
export const defaultRefreshInterval: number = 360; // 6h

export interface Collection {
  id: ID;
  title: string;
  unreadCount: number;
  icon: CollectionIconType;
  parentId?: ID;
  children?: Collection[];

  description?: string;
  url?: string;
  dateUpdated?: number;
  refreshInterval?: number;
  layout?: CollectionLayout;
}

export type FlatCollection = Omit<Collection, 'children'> & {
  parents: Array<ID>;
  children: Array<ID>;
  order: number;
  orderPath: Array<number>;
  level: number;
  isLastChild: boolean;
  parentOrder?: number;
};

export interface CollectionItem {
  id: ID;
  previousId: ID | null;
  nextId: ID | null;
  url: string;
  title: string;
  summary: string;
  fullText: string;
  thumbnailUrl?: string;
  datePublished: number;
  dateUpdated: number;
  dateRead?: number;
  categories?: string[];
  comments?: string;

  collection: Pick<Collection, 'id' | 'title' | 'icon'>;
  readingTime: number;
  onReadingList: boolean;
}

export type CollectionItemDetails = Omit<
  CollectionItem,
  'collection_id' | 'collection_title' | 'collection_icon'
>;

export const CollectionLayouts = ['card', 'magazine'] as const;
export type CollectionLayout = typeof CollectionLayouts[number];
export const defaultCollectionLayout: CollectionLayout = 'card';

export const AvatarStyles = ['fallback', 'initials'] as const;
export type AvatarStyle = typeof AvatarStyles[number];
export const defaultAvatarStyle: AvatarStyle = 'fallback';

interface CommonPreferences {
  expandedCollectionIds: Array<ID>;
  defaultCollectionLayout: CollectionLayout;
  homeCollectionLayout: CollectionLayout;
  avatarStyle: AvatarStyle;
}

export type ViewPreference =
  | { activeView: 'home' }
  | { activeView: 'collection'; activeCollectionId: number };

export type Preferences = CommonPreferences & ViewPreference;

export const defaultPreferences: Preferences = {
  activeView: 'home',
  defaultCollectionLayout,
  homeCollectionLayout: defaultCollectionLayout,
  expandedCollectionIds: [],
  avatarStyle: defaultAvatarStyle,
};

export interface User {
  username: string;
  displayName: string;
  avatarUrl?: string;
}
export const placeholderUser: User = {
  displayName: '',
  username: '',
};

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
