import { Collection, ID } from '@orpington-news/shared';
import { sortBy, lensPath, view, set, values } from 'rambda';
import { DBCollection } from './sql';

type DBCollectionWithChildren = DBCollection & {
  children?: Record<ID, DBCollectionWithChildren>;
};

const flattenJSON = (
  json: Record<ID, DBCollectionWithChildren>
): Collection[] => {
  return sortBy((j) => j.order, values(json)).map((col): Collection => {
    const { parents, level, order, children, ...rest } = col;
    return {
      ...rest,
      children: children && flattenJSON(children),
    };
  });
};

export const inflateCollections = (
  collections: readonly DBCollection[]
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
    const parent: DBCollectionWithChildren | undefined = view(parentLens, acc);
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
  }, {} as Record<ID, DBCollectionWithChildren>);

  return flattenJSON(json);
};
