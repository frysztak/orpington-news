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

export interface Collection {
  id: ID;
  slug: string;
  name: string;
  unreadCount: number;
  icon?: CollectionIconType;
  children?: Collection[];
}

export interface CollectionItem {
  id: ID;
  title: string;
  slug: string;
  url: string;
  summary: string;
  fullText: string;
  thumbnailUrl?: string;
  datePublished: Date;
  dateUpdated?: Date;
  categories?: string[];
  comments?: string;

  collection: Collection;
  readingTime: number;
  onReadingList: boolean;
}
