import { Collection, FlatCollection, ID } from '@orpington-news/shared';
import { sum, last, sortBy, lensPath, view, set, values } from 'rambda';

type FlatCollectionWithChildren = FlatCollection & {
  children?: Record<ID, FlatCollectionWithChildren>;
};

const flattenJSON = (
  json: Record<ID, FlatCollectionWithChildren>
): Collection[] => {
  return sortBy((j) => j.order, values(json)).map((col): Collection => {
    const { parents, level, order, children, ...rest } = col;

    return {
      ...rest,
      unreadCount: countUnread(col),
      children: children && flattenJSON(children),
      parentId: last(parents),
    };
  });
};

export const inflateCollections = (
  collections: readonly FlatCollection[]
): Collection[] => {
  const json = collections.reduce((acc, col) => {
    if (col.parents.length === 0) {
      return {
        ...acc,
        [col.id]: col,
      };
    }

    const parentPath = col.parents.join('.children.');
    const parentLens = lensPath(parentPath);
    const parent: FlatCollectionWithChildren | undefined = view(
      parentLens,
      acc
    );
    if (!parent) {
      console.warn(`Parent path '${parentPath}' not found.`);
      return acc;
    }

    const children = parent.children ?? [];
    return set(
      parentLens,
      {
        ...parent,
        children: { ...children, [col.id]: col },
      },
      acc
    );
  }, {} as Record<ID, FlatCollectionWithChildren>);

  return flattenJSON(json);
};

const countUnread = (collection: FlatCollectionWithChildren): number => {
  return sum([
    collection.unreadCount,
    ...Object.values(collection.children ?? []).map(countUnread),
  ]);
};
