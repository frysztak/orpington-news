import { Collection, ID } from '@orpington-news/shared';
import { sum, sortBy, lensPath, view, set, values } from 'rambda';
import { DBCollection } from './sql';

type DBCollectionWithChildren = DBCollection & {
  children?: Record<ID, DBCollectionWithChildren>;
};

const flattenJSON = (
  json: Record<ID, DBCollectionWithChildren>
): Collection[] => {
  return sortBy((j) => j.order, values(json)).map((col): Collection => {
    const {
      parents,
      level,
      order,
      children,
      date_updated,
      unread_count,
      ...rest
    } = col;

    return {
      ...rest,
      dateUpdated: date_updated,
      unreadCount: countUnread(col),
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

const countUnread = (collection: DBCollectionWithChildren): number => {
  return sum([
    collection.unread_count ?? 0,
    ...Object.values(collection.children ?? []).map(countUnread),
  ]);
};
