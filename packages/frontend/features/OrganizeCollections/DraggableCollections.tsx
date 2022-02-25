import { useCallback, useMemo, useRef } from 'react';
import { Box, VStack } from '@chakra-ui/react';
import { DropTargetMonitor, useDrag, useDrop, XYCoord } from 'react-dnd';
import {
  Collection,
  ID,
  inhibitUntilArgsChanged,
  noop,
} from '@orpington-news/shared';
import { getCollectionIcon } from '@components/sidebar/CollectionIcon';
import { SidebarItem } from '@components/sidebar/SidebarItem';
import type {
  DnDEvent,
  DropEvent,
  HoverEvent,
  HoverPosition,
  HoverStatus,
} from './dndTypes';
import { HoverStatusWrapper } from './HoverStatusWrapper';
import { resolveIfCanDrop } from './resolvers';
import type { ParentsMap } from './parentsChildrenLUT';

interface CollapsibleCollectionListProps {
  index: number;
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

const CollapsibleCollectionList: React.FC<CollapsibleCollectionListProps> = (
  props
) => {
  const {
    index,
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
          targetCollectionIndex: index,
          targetCollectionHasChildren: children ? children.length > 0 : false,
        },
      };
    },
    [children, getHoverPosition, id, index, isLast, parentId, parentIndex]
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

  return (
    <>
      <HoverStatusWrapper
        collection={collection}
        hoverStatus={hoverStatus}
        ref={ref}
      >
        <SidebarItem
          title={title}
          icon={icon}
          isActive={false}
          chevron={hasChildren ? (isOpen ? 'bottom' : 'top') : undefined}
          onClick={noop}
          onChevronClick={handleChevronClick(collection)}
          style={{ opacity }}
        />
      </HoverStatusWrapper>
      <Box pl={4} w="full">
        {isOpen &&
          children?.map((collection: Collection, idx: number, array) => (
            <CollapsibleCollectionList
              key={collection.id}
              index={idx}
              parentId={id}
              parentIndex={index}
              isLast={idx === array.length - 1}
              collection={collection}
              expandedCollectionIDs={expandedCollectionIDs}
              hoverStatus={hoverStatus}
              parentsMap={parentsMap}
              onChevronClicked={handleChevronClick(collection)}
              onDnDEvent={onDnDEvent}
            />
          ))}
      </Box>
    </>
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

  const handleDnDEvent = useMemo(
    () => inhibitUntilArgsChanged(onDnDEvent),
    [onDnDEvent]
  );

  return (
    <VStack w="full" spacing={1}>
      {collections.map((collection: Collection, idx: number, array) => (
        <CollapsibleCollectionList
          key={collection.id}
          index={idx}
          isLast={idx === array.length - 1}
          collection={collection}
          expandedCollectionIDs={expandedCollectionIDs}
          hoverStatus={hoverStatus}
          parentsMap={parentsMap}
          onChevronClicked={onChevronClicked}
          onDnDEvent={handleDnDEvent}
        />
      ))}
    </VStack>
  );
};