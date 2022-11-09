import type { Collection } from '@orpington-news/shared';

export const filterVisibleCollections = (
  collections: Collection[],
  expandedCollectionIDs?: number[]
): Collection[] => {
  const set = new Set(expandedCollectionIDs);
  return collections.filter(({ isHome, parents: allParents }) => {
    // hide "Home" collection - it appears in a different place in the UI
    if (isHome) {
      return false;
    }

    // skip Home collection
    const [, ...parents] = allParents;

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
