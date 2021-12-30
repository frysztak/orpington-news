export interface Collection {
  id: string;
  slug: string;
  name: string;
}

export interface CollectionItem {
  id: string;
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

export interface FeedItemProps {
  item: CollectionItem;
  onClick?: () => void;
}

export interface FeedLayoutProps {
  title: string;
  feedItems: CollectionItem[];
}

export const Layouts = ['magazine'] as const;
export type LayoutType = typeof Layouts[number];
