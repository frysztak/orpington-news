import { useCallback, useMemo, useState } from 'react';
import { Collection, FlatCollection, ID } from '@orpington-news/shared';
import { buildParentsChildrenMap, ParentsMap } from '@features/Collections';
import type {
  DnDEvent,
  HoverEvent,
  HoverStatus,
  MoveCollectionEvent,
} from './dndTypes';
import {
  resolveIfCanDrop,
  resolveLogicalPosition,
  resolveNewParentAfterDrop,
} from './resolvers';

const resolveHoverStatus = (
  event: HoverEvent,
  parentsMap: ParentsMap
): HoverStatus | undefined => {
  const { targetInfo, hoverPosition } = event;
  const { targetCollectionId } = targetInfo;

  const canDropPayload = resolveIfCanDrop(event, parentsMap);
  if (!canDropPayload.canDrop) {
    return {
      status: 'dropLocationForbidden',
      location: targetCollectionId,
      reason: canDropPayload.reason,
    };
  }

  const pointerPosition = resolveLogicalPosition(targetInfo, hoverPosition);

  return {
    status: 'dropLocationAllowed',
    location: targetCollectionId,
    logicalPosition: pointerPosition,
  };
};

export const useDndHandler = (
  onDrop: (newParent: MoveCollectionEvent) => void,
  flatCollections?: FlatCollection[]
) => {
  const [hoverStatus, setHoverStatus] = useState<HoverStatus>();
  const [expandedCollections, setExpandedCollections] = useState<Set<ID>>(
    new Set()
  );

  const expandCollection = useCallback((collectionId: ID) => {
    setExpandedCollections((expandedCollections) =>
      new Set(expandedCollections).add(collectionId)
    );
  }, []);

  const { parentsMap, childrenMap } = useMemo(
    () => buildParentsChildrenMap(flatCollections),
    [flatCollections]
  );

  const onDnDEvent = useCallback(
    (event: DnDEvent) => {
      switch (event.type) {
        case 'hover': {
          setHoverStatus(resolveHoverStatus(event, parentsMap));

          const {
            targetInfo: { targetCollectionId },
            hoverPosition,
          } = event;

          if (
            hoverPosition &&
            !expandedCollections.has(targetCollectionId) &&
            childrenMap.has(targetCollectionId)
          ) {
            expandCollection(targetCollectionId);
          }
          break;
        }

        case 'drop': {
          const newParent = resolveNewParentAfterDrop(event, parentsMap);
          if ('error' in newParent) {
            setHoverStatus({
              status: 'dropLocationForbidden',
              location: event.targetInfo.targetCollectionId,
              reason: newParent.error,
            });
          } else {
            setHoverStatus(undefined);
            onDrop(newParent);
            const parentId = newParent.newParentId;
            if (parentId !== null) {
              expandCollection(parentId);
            }
          }
          break;
        }

        case 'dragEnd': {
          setHoverStatus(undefined);
          break;
        }
      }
    },
    [childrenMap, expandCollection, expandedCollections, onDrop, parentsMap]
  );

  const onChevronClicked = useCallback((collection: Collection) => {
    setExpandedCollections((collections) => {
      const newSet = new Set(collections);
      if (collections.has(collection.id)) {
        newSet.delete(collection.id);
      } else {
        newSet.add(collection.id);
      }
      return newSet;
    });
  }, []);

  return {
    hoverStatus,
    expandedCollections,
    parentsMap,
    onDnDEvent,
    onChevronClicked,
  };
};
