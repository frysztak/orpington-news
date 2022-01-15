import { ID } from '@orpington-news/shared';

export const collectionKeys = {
  base: ['collection'] as const,
  tree: ['collection', 'tree'] as const,
  allForId: (collectionId: ID) =>
    [...collectionKeys.base, collectionId] as const,
  list: (collectionId: ID | string) =>
    [...collectionKeys.base, collectionId, 'list'] as const,
  detail: (collectionId: ID, itemSlug: string) =>
    [...collectionKeys.base, collectionId, 'detail', { itemSlug }] as const,
};
