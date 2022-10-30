import { Collection, ID } from '@orpington-news/shared';

export type ParentsMap = Map<ID, Set<ID>>;
export type ChildrenMap = ParentsMap;

export const buildParentsChildrenMap = (
  Collections?: Collection[]
): { parentsMap: ParentsMap; childrenMap: ChildrenMap } => {
  const parentsMap = new Map<ID, Set<ID>>();
  const childrenMap = new Map<ID, Set<ID>>();

  if (!Collections) {
    return { parentsMap, childrenMap };
  }

  for (const collection of Collections) {
    parentsMap.set(collection.id, new Set(collection.parents));

    for (const parent of collection.parents) {
      const children = childrenMap.has(parent)
        ? new Set(childrenMap.get(parent)).add(collection.id)
        : new Set([collection.id]);
      childrenMap.set(parent, children);
    }
  }

  return { parentsMap, childrenMap };
};

/**
 *  Answers the question "Is id2 a parent of id1?"
 */
export const isParentOf = (
  parentsMap: ParentsMap,
  id1: ID,
  id2: ID
): boolean => {
  const parents = parentsMap.get(id2);
  return parents?.has(id1) ?? false;
};

/**
 * Returns parents of `id`
 */
export const getParents = (parentsMap: ParentsMap, id: ID): Array<ID> => {
  return Array.from(parentsMap.get(id)?.values() ?? []);
};
