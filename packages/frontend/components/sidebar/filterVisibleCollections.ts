import type { FlatCollection } from '@orpington-news/shared';

export const filterVisibleCollections = (
  collections: FlatCollection[],
  expandedCollectionIDs?: number[]
): FlatCollection[] => {
  const set = new Set(expandedCollectionIDs);
  return collections.filter(({ parents }) => {
    // always show main-level items
    if (parents.length === 0) {
      return true;
    }

    // check whole parent chain
    for (const parent of parents) {
      if (!set.has(parent)) {
        return false;
      }
    }

    return true;
  });
};
