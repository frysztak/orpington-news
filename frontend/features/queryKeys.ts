import {
  CollectionFilter,
  CollectionGrouping,
  CollectionSortBy,
  ID,
} from '@shared';

export const collectionKeys = {
  base: ['collection'] as const,
  tree: ['collection', 'tree'] as const,
  allForId: (collectionId: ID) =>
    [...collectionKeys.base, collectionId] as const,
  lists: (collectionId: ID) =>
    [...collectionKeys.base, collectionId, 'list'] as const,
  list: (
    collectionId: ID,
    filter?: CollectionFilter,
    grouping?: CollectionGrouping,
    sortBy?: CollectionSortBy
  ) =>
    [
      ...collectionKeys.lists(collectionId),
      { filter, grouping, sortBy },
    ] as const,
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