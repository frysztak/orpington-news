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
export const defaultRefreshInterval: number = 120;

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

export type FlatCollection = Omit<Collection, 'children' | 'parentId'> & {
  parents: Array<ID>;
  order: number;
  level: number;
};

export interface CollectionItem {
  id: ID;
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
