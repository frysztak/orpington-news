import { ID } from '@shared';

export type HoverPosition = 'top' | 'center' | 'bottom';

export type TargetInfo = {
  targetCollectionId: ID;
  targetCollectionIndex: number;
  targetCollectionParentId?: ID;
  targetCollectionParentIndex?: number;
  targetCollectionLastChild: boolean;
  targetCollectionHasChildren: boolean;
};

export type HoverEvent = {
  type: 'hover';
  draggedCollectionId: ID;
  hoverPosition: HoverPosition;
  targetInfo: TargetInfo;
};

export type DragEndEvent = {
  type: 'dragEnd';
};

export type DropEvent = {
  type: 'drop';
  draggedCollectionId: ID;
  hoverPosition: HoverPosition;
  targetInfo: TargetInfo;
};

export type DnDEvent = HoverEvent | DragEndEvent | DropEvent;
export type DnDEventType = DnDEvent['type'];

export type LogicalPosition = 'above' | 'below' | 'child' | 'belowParent';

interface DropLocationForbidden {
  status: 'dropLocationForbidden';
  location: ID;
  reason: string;
}

interface DropLocationAllowed {
  status: 'dropLocationAllowed';
  location: ID;
  logicalPosition: LogicalPosition;
}

export type HoverStatus = DropLocationForbidden | DropLocationAllowed;

export interface MoveCollectionEvent {
  collectionId: ID;
  newParentId: ID | null;
  newOrder: number;
}
