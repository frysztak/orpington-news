import { ID } from '@orpington-news/shared';
import { last } from 'rambda';
import {
  DropEvent,
  HoverEvent,
  HoverPosition,
  LogicalPosition,
  MoveCollectionEvent,
  TargetInfo,
} from './dndTypes';
import { isParentOf, ParentsMap } from './parentsChildrenLUT';

export const resolveLogicalPosition = (
  targetInfo: TargetInfo,
  hoverPosition: HoverPosition
): LogicalPosition => {
  const {
    targetCollectionLastChild,
    targetCollectionParentId,
    targetCollectionHasChildren,
    targetCollectionIndex,
  } = targetInfo;

  if (
    targetCollectionIndex === 0 &&
    targetCollectionParentId === undefined &&
    hoverPosition === 'top'
  ) {
    return 'above';
  }

  if (hoverPosition === 'bottom') {
    if (targetCollectionHasChildren) {
      return 'child';
    }

    if (targetCollectionParentId !== undefined && targetCollectionLastChild) {
      return 'belowParent';
    }
  }

  if (hoverPosition === 'center') {
    return 'child';
  }

  return 'below';
};

type CanDropPayload = { canDrop: true } | { canDrop: false; reason: string };

export const resolveIfCanDrop = (
  event: HoverEvent,
  parentsMap: ParentsMap
): CanDropPayload => {
  const { draggedCollectionId, targetInfo } = event;
  const { targetCollectionId } = targetInfo;

  if (draggedCollectionId === targetCollectionId) {
    return {
      canDrop: false,
      reason: 'Cannot drop collection on itself',
    };
  }

  if (isParentOf(parentsMap, draggedCollectionId, targetCollectionId)) {
    return {
      canDrop: false,
      reason: 'Cannot drop collection inside itself',
    };
  }

  return { canDrop: true };
};

export const resolveNewParentAfterDrop = (
  event: DropEvent,
  parentsMap: ParentsMap
): MoveCollectionEvent | { error: string } => {
  const { draggedCollectionId, targetInfo, hoverPosition } = event;
  const logicalPosition = resolveLogicalPosition(targetInfo, hoverPosition);

  switch (logicalPosition) {
    case 'child': {
      return {
        collectionId: draggedCollectionId,
        newParentId: targetInfo.targetCollectionId,
        newOrder: 0,
      };
    }
    case 'above': {
      const { targetCollectionParentId, targetCollectionIndex } = targetInfo;

      return {
        collectionId: draggedCollectionId,
        newParentId: targetCollectionParentId ?? null,
        newOrder: targetCollectionIndex,
      };
    }
    case 'below': {
      const { targetCollectionParentId, targetCollectionIndex } = targetInfo;

      return {
        collectionId: draggedCollectionId,
        newParentId: targetCollectionParentId ?? null,
        newOrder: targetCollectionIndex + 1,
      };
    }
    case 'belowParent': {
      const { targetCollectionParentId, targetCollectionParentIndex } =
        targetInfo;

      if (
        targetCollectionParentId === undefined ||
        targetCollectionParentIndex === undefined
      ) {
        console.error(
          `Resolved drop position to 'belowParent', but targetCollectionParentId = ${targetCollectionParentId} and targetCollectionParentIndex = ${targetCollectionParentIndex}. This indicates logical error.`
        );
        return { error: 'Cannot drop here.' };
      }

      const parents: ID[] = [
        ...(parentsMap.get(targetCollectionParentId) ?? []),
      ];
      return {
        collectionId: draggedCollectionId,
        newParentId: last(parents) ?? null,
        newOrder: targetCollectionParentIndex + 1,
      };
    }
  }
};
