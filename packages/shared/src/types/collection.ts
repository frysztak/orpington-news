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

export const CollectionLayout = z.enum(['card', 'magazine']);
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

export const Collection = z.object({
  id: ID,
  title: z.string(),
  unreadCount: z.number(),
  icon: CollectionIcons,
  parentId: z.optional(ID),
  children: z.optional(z.array(z.number())),
  // ^ remove that shit

  description: z.optional(z.string()),
  url: z.optional(z.string()),
  dateUpdated: z.optional(z.number()),
  refreshInterval: z.optional(z.number()),
  layout: z.optional(CollectionLayout),
});
export type Collection = z.infer<typeof Collection>;

export const FlatCollection = Collection.omit({
  children: true,
}).merge(
  z.object({
    parents: z.array(ID),
    children: z.array(ID),
    order: z.number(),
    orderPath: z.array(z.number()),
    level: z.number(),
    isLastChild: z.boolean(),
    parentOrder: z.optional(z.number()),
  })
);
export type FlatCollection = z.infer<typeof FlatCollection>;

/*
export type FlatCollection = Omit<Collection, 'children'> & {
  parents: Array<ID>;
  children: Array<ID>;
  order: number;
  orderPath: Array<number>;
  level: number;
  isLastChild: boolean;
  parentOrder?: number;
};
*/

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

  collection: FlatCollection.pick({
    id: true,
    title: true,
    icon: true,
  }),
  readingTime: z.number(),
  onReadingList: z.boolean(),
});
export type CollectionItem = z.infer<typeof CollectionItem>;

/*
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

  collection: Pick<FlatCollection, 'id' | 'title' | 'icon'>;
  readingTime: number;
  onReadingList: boolean;
}*/

export type CollectionItemDetails = Omit<
  CollectionItem,
  'collection_id' | 'collection_title' | 'collection_icon'
>;
