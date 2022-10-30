import { useCallback, useMemo, useRef } from 'react';
import { DropTargetMonitor, useDrag, useDrop, XYCoord } from 'react-dnd';
import { motion } from 'framer-motion';
import { Virtuoso } from 'react-virtuoso';
import {
  Collection,
  ID,
  inhibitUntilArgsChanged,
  noop,
} from '@orpington-news/shared';
import { getCollectionIcon } from '@components/sidebar/CollectionIcon';
import { SidebarItem } from '@components/sidebar/SidebarItem';
import { calcItemPadding, filterVisibleCollections } from '@components/sidebar';
import type { ParentsMap } from '@features/Collections';
import type {
  DnDEvent,
  DropEvent,
  HoverEvent,
  HoverPosition,
  HoverStatus,
} from './dndTypes';
import {
  HoverStatusWrapper,
  HoverStatusWrapperProps,
} from './HoverStatusWrapper';
import { resolveIfCanDrop } from './resolvers';

export const MotionHoverStatusWrapper =
  motion<HoverStatusWrapperProps>(HoverStatusWrapper);

interface ItemContentProps {
  order: number;
  parentId?: ID;
  parentIndex?: number;
  isLast: boolean;
  collection: Collection;
  expandedCollectionIDs?: Set<ID>;
  hoverStatus?: HoverStatus;
  parentsMap: ParentsMap;

  onChevronClicked: (collection: Collection) => void;
  onDnDEvent: (event: DnDEvent) => void;
}

const ItemContent: React.FC<ItemContentProps> = (props) => {
  const {
    order,
    parentId,
    parentIndex,
    isLast,
    collection,
    expandedCollectionIDs,
    hoverStatus,
    parentsMap,
    onChevronClicked,
    onDnDEvent,
  } = props;

  const { id, title, children } = collection;

  const hasChildren = Boolean(children) && children?.length !== 0;
  const isOpen = expandedCollectionIDs?.has(id) ?? false;

  const handleChevronClick = (collection: Collection) => () =>
    onChevronClicked(collection);

  const icon = useMemo(
    () => getCollectionIcon(collection.icon),
    [collection.icon]
  );

  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging, opacity }, drag] = useDrag(
    () => ({
      type: 'collection',
      item: collection,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
        opacity: monitor.isDragging() ? 0.5 : 1,
      }),
      end: (draggedItem: Collection) => {
        onDnDEvent({ type: 'dragEnd' });
      },
    }),
    []
  );

  const getHoverPosition = useCallback(
    (monitor: DropTargetMonitor): HoverPosition | null => {
      if (!ref.current) {
        return null;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverElementHeight =
        hoverBoundingRect.bottom - hoverBoundingRect.top;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      const threshold = 0.25;

      if (hoverClientY < hoverElementHeight * threshold) {
        return 'top';
      }

      if (hoverClientY > hoverElementHeight * (1 - threshold)) {
        return 'bottom';
      }

      return 'center';
    },
    []
  );

  const getDndEvent = useCallback(
    (
      item: Collection,
      monitor: DropTargetMonitor,
      type: 'hover' | 'drop'
    ): HoverEvent | DropEvent | null => {
      const hoverPosition = getHoverPosition(monitor);
      if (hoverPosition === null) {
        return null;
      }

      const dragId = item.id;
      const hoverId = id;

      return {
        type,
        hoverPosition,
        draggedCollectionId: dragId,
        targetInfo: {
          targetCollectionId: hoverId,
          targetCollectionParentId: parentId,
          targetCollectionParentIndex: parentIndex,
          targetCollectionLastChild: isLast,
          targetCollectionIndex: order,
          targetCollectionHasChildren: children ? children.length > 0 : false,
        },
      };
    },
    [children, getHoverPosition, id, order, isLast, parentId, parentIndex]
  );

  const [, drop] = useDrop({
    accept: 'collection',
    hover: (item: Collection, monitor) => {
      const event = getDndEvent(item, monitor, 'hover');
      if (event) {
        onDnDEvent(event);
      }
    },
    drop: (item: Collection, monitor) => {
      const event = getDndEvent(item, monitor, 'drop');
      if (event) {
        onDnDEvent(event);
      }
    },
    canDrop: (item: Collection, monitor) => {
      const event = getDndEvent(item, monitor, 'hover') as HoverEvent;
      if (event) {
        return resolveIfCanDrop(event, parentsMap).canDrop;
      }
      return false;
    },
  });

  drag(drop(ref));

  const chevron = hasChildren ? (isOpen ? 'bottom' : 'top') : undefined;

  return (
    <div
      style={
        {
          '--extra-padding-left': calcItemPadding(chevron, collection.level),
        } as React.CSSProperties
      }
    >
      <MotionHoverStatusWrapper
        layout="position"
        layoutId={id.toString()}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        collection={collection}
        hoverStatus={hoverStatus}
        dndRef={ref}
      >
        <SidebarItem
          title={title}
          icon={icon}
          isActive={false}
          level={collection.level}
          chevron={chevron}
          onClick={noop}
          onChevronClick={handleChevronClick(collection)}
          style={{ opacity }}
        />
      </MotionHoverStatusWrapper>
    </div>
  );
};

export interface DraggableCollectionsProps {
  collections: Collection[];
  expandedCollectionIDs?: Set<ID>;
  hoverStatus?: HoverStatus;
  parentsMap: ParentsMap;

  onChevronClicked: (collection: Collection) => void;
  onDnDEvent: (event: DnDEvent) => void;
}

export const DraggableCollections: React.FC<DraggableCollectionsProps> = (
  props
) => {
  const {
    collections,
    expandedCollectionIDs,
    hoverStatus,
    parentsMap,
    onChevronClicked,
    onDnDEvent,
  } = props;

  const debouncedDndEvent = useMemo(
    () => inhibitUntilArgsChanged(onDnDEvent),
    [onDnDEvent]
  );

  const handleDnDEvent = useCallback(
    (event: DnDEvent) => {
      // for rather mysterious reasons, `dragEnd` sometimes doesn't propagate through `inhibitUntilArgsChanged`...
      if (event.type === 'dragEnd') {
        return onDnDEvent(event);
      }
      return debouncedDndEvent(event);
    },
    [debouncedDndEvent, onDnDEvent]
  );

  const visibleCollections = useMemo(
    () =>
      filterVisibleCollections(
        collections,
        Array.from(expandedCollectionIDs ?? [])
      ),
    [collections, expandedCollectionIDs]
  );

  return (
    <Virtuoso
      style={{ height: '100%', width: '100%' }}
      data={visibleCollections}
      computeItemKey={(_, item) => item.id}
      itemContent={(index) => {
        const collection = visibleCollections[index];
        return (
          <ItemContent
            collection={collection}
            order={collection.order}
            isLast={collection.isLastChild}
            parentId={collection.parentId}
            parentIndex={collection.parentOrder}
            hoverStatus={hoverStatus}
            parentsMap={parentsMap}
            expandedCollectionIDs={expandedCollectionIDs}
            onChevronClicked={onChevronClicked}
            onDnDEvent={handleDnDEvent}
          />
        );
      }}
    />
  );
};
