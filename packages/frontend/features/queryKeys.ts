import { ID } from '@orpington-news/shared';

export const collectionKeys = {
  base: ['collection'] as const,
  tree: ['collection', 'tree'] as const,
  home: ['collection', 'home'] as const,
  allForId: (collectionId: ID | string) =>
    [...collectionKeys.base, collectionId] as const,
  list: (collectionId: ID | string) =>
    [...collectionKeys.base, collectionId, 'list'] as const,
  detail: (collectionId: ID, itemSerialId: ID) =>
    [...collectionKeys.base, collectionId, 'detail', { itemSerialId }] as const,
};
