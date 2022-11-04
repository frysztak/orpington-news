import { z } from 'zod';
import { numeric } from '../utils';
import { ID } from './id';

export const CollectionIcons = z.enum([
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
]);

export type CollectionIconType = z.infer<typeof CollectionIcons>;
export const defaultIcon: CollectionIconType = 'Code';
export const defaultRefreshInterval: number = 360; // 6h

export const CollectionLayout = z.enum(['card', 'magazine', 'list']);
export type CollectionLayout = z.infer<typeof CollectionLayout>;
export const defaultCollectionLayout: CollectionLayout = 'card';

export const CollectionId = z.object({
  id: numeric(ID),
});
export type CollectionId = z.infer<typeof CollectionId>;

export const HomeCollectionId = z.object({
  id: z.literal('home').or(numeric(ID)),
});
export type HomeCollectionId = z.infer<typeof CollectionId>;

export const CollectionFilter = z.enum(['all', 'unread', 'read']);
export type CollectionFilter = z.infer<typeof CollectionFilter>;
export const defaultCollectionFilter: CollectionFilter = 'all';

export const CollectionGrouping = z.enum(['none', 'feed', 'date']);
export type CollectionGrouping = z.infer<typeof CollectionGrouping>;
export const defaultCollectionGrouping: CollectionGrouping = 'none';

export const Collection = z.object({
  id: ID,
  title: z.string(),
  unreadCount: z.number(),
  icon: CollectionIcons,
  parentId: z.optional(ID),

  description: z.optional(z.string()),
  url: z.optional(z.string()),
  dateUpdated: z.optional(z.number()),
  refreshInterval: z.optional(z.number()),
  layout: z.optional(CollectionLayout),
  filter: z.optional(CollectionFilter),
  grouping: z.optional(CollectionGrouping),
  sortBy: z.optional(z.string()),

  parents: z.array(ID),
  children: z.array(ID),
  order: z.number(),
  orderPath: z.array(z.number()),
  level: z.number(),
  isLastChild: z.boolean(),
  parentOrder: z.optional(z.number()),
});
export type Collection = z.infer<typeof Collection>;

export const AddCollection = Collection.pick({
  title: true,
  icon: true,
  parentId: true,
  description: true,
  url: true,
  refreshInterval: true,
  dateUpdated: true,
  layout: true,
});
export type AddCollection = z.infer<typeof AddCollection>;

export const UpdateCollection = Collection.pick({
  id: true,
  title: true,
  icon: true,
  parentId: true,
  description: true,
  url: true,
  refreshInterval: true,
});
export type UpdateCollection = z.infer<typeof UpdateCollection>;

export const CollectionItem = z.object({
  id: ID,
  previousId: z.nullable(ID),
  nextId: z.nullable(ID),
  url: z.string(),
  title: z.string(),
  summary: z.string(),
  fullText: z.string(),
  thumbnailUrl: z.string().optional(),
  datePublished: z.number(),
  dateUpdated: z.number(),
  dateRead: z.number().optional(),
  categories: z.string().array().optional(),
  comments: z.string().optional(),

  collection: Collection.pick({
    id: true,
    title: true,
    icon: true,
  }),
  readingTime: z.number(),
  onReadingList: z.boolean(),
});
export type CollectionItem = z.infer<typeof CollectionItem>;

export const CollectionPreferences = Collection.pick({
  layout: true,
  filter: true,
  grouping: true,
});
export type CollectionPreferences = z.infer<typeof CollectionPreferences>;
