import { ID } from '@orpington-news/shared';

export const collectionKeys = {
  all: ['collections'] as const,
  lists: () => [...collectionKeys.all, 'list'] as const,
  list: (collectionId: ID) =>
    [...collectionKeys.all, 'list', { collectionId }] as const,
  details: () => [...collectionKeys.all, 'detail'] as const,
  detail: (collectionSlug: string, itemSlug: string) =>
    [...collectionKeys.all, 'detail', { collectionSlug, itemSlug }] as const,
};
