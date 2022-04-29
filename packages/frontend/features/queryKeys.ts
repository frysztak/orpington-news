import { ID } from '@orpington-news/shared';

export const collectionKeys = {
  base: ['collection'] as const,
  tree: ['collection', 'tree'] as const,
  home: ['collection', 'home'] as const,
  allForId: (collectionId: ID | string) =>
    [...collectionKeys.base, collectionId] as const,
  list: (collectionId: ID | string) =>
    [...collectionKeys.base, collectionId, 'list'] as const,
  detail: (collectionId: ID, itemId: ID) =>
    [...collectionKeys.base, collectionId, 'detail', { itemId }] as const,
};

export const preferencesKeys = {
  base: ['preferences'] as const,
};

export const userKeys = {
  base: ['user'] as const,
  info: ['user', 'info'] as const,
};
