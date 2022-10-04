import React, { useCallback, useMemo } from 'react';
import { Icon, MenuDivider, Text, MenuItem, VStack } from '@chakra-ui/react';
import { CgRemove } from '@react-icons/all-files/cg/CgRemove';
import { IoRefresh } from '@react-icons/all-files/io5/IoRefresh';
import { IoCheckmarkDone } from '@react-icons/all-files/io5/IoCheckmarkDone';
import { AiTwotoneEdit } from '@react-icons/all-files/ai/AiTwotoneEdit';
import {
  ExclamationCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/solid';
import { Virtuoso } from 'react-virtuoso';
import { ID, FlatCollection } from '@orpington-news/shared';
import { SidebarItem } from './SidebarItem';
import { getCollectionIcon } from './CollectionIcon';
import { CollectionsSkeleton } from './CollectionsSkeleton';
import { filterVisibleCollections } from './filterVisibleCollections';

export type CollectionMenuAction = 'markAsRead' | 'refresh' | 'edit' | 'delete';

interface ItemContentProps {
  collection: FlatCollection;

  activeCollectionId?: ID;
  expandedCollectionIDs?: Array<ID>;
  collectionsCurrentlyUpdated?: Set<ID>;

  onCollectionClicked: (collection: FlatCollection) => void;
  onChevronClicked: (collection: FlatCollection) => void;
  onCollectionMenuActionClicked: (
    collection: FlatCollection,
    action: CollectionMenuAction
  ) => void;
}

const ItemContent: React.FC<ItemContentProps> = ({
  collection,
  activeCollectionId,
  expandedCollectionIDs,
  collectionsCurrentlyUpdated,
  onCollectionClicked,
  onChevronClicked,
  onCollectionMenuActionClicked,
}) => {
  const { title, id, unreadCount, level, children } = collection;

  const isOpen = expandedCollectionIDs?.includes(id) ?? false;
  const hasChildren = children?.length > 0;

  const handleChevronClick = useCallback(
    () => onChevronClicked(collection),
    [collection, onChevronClicked]
  );
  const handleClick = useCallback(
    () => onCollectionClicked(collection),
    [collection, onCollectionClicked]
  );

  const icon = useMemo(
    () => getCollectionIcon(collection.icon),
    [collection.icon]
  );

  const handleMenuItemClick = useCallback(
    (action: CollectionMenuAction) => () => {
      onCollectionMenuActionClicked(collection, action);
    },
    [collection, onCollectionMenuActionClicked]
  );

  return (
    <SidebarItem
      title={title}
      isActive={activeCollectionId === id}
      icon={icon}
      level={level}
      counter={unreadCount}
      isLoading={collectionsCurrentlyUpdated?.has(id) ?? false}
      chevron={hasChildren ? (isOpen ? 'bottom' : 'top') : undefined}
      onClick={handleClick}
      onChevronClick={handleChevronClick}
      menuItems={
        <>
          <MenuItem
            icon={<IoCheckmarkDone />}
            onClick={handleMenuItemClick('markAsRead')}
            data-test="markAsRead"
          >
            Mark as read
          </MenuItem>
          <MenuItem
            icon={<IoRefresh />}
            onClick={handleMenuItemClick('refresh')}
            data-test="refresh"
          >
            Refresh
          </MenuItem>
          <MenuItem
            icon={<AiTwotoneEdit />}
            onClick={handleMenuItemClick('edit')}
            data-test="edit"
          >
            Edit
          </MenuItem>
          <MenuDivider />
          <MenuItem
            icon={<CgRemove />}
            onClick={handleMenuItemClick('delete')}
            data-test="delete"
          >
            Delete
          </MenuItem>
        </>
      }
      data-test={`collection-id-${id}`}
    />
  );
};

export interface CollectionsProps {
  isLoading?: boolean;
  isError?: boolean;
  collections: FlatCollection[];
  activeCollectionId?: ID;
  expandedCollectionIDs?: Array<ID>;
  collectionsCurrentlyUpdated?: Set<ID>;

  onCollectionClicked: (collection: FlatCollection) => void;
  onChevronClicked: (collection: FlatCollection) => void;
  onCollectionMenuActionClicked: (
    collection: FlatCollection,
    action: CollectionMenuAction
  ) => void;
}

export const Collections: React.FC<CollectionsProps> = (props) => {
  const {
    isLoading = false,
    isError = false,
    collections,
    activeCollectionId,
    expandedCollectionIDs,
    collectionsCurrentlyUpdated,
    onCollectionClicked,
    onChevronClicked,
    onCollectionMenuActionClicked,
  } = props;

  const visibleCollections = useMemo(
    () => filterVisibleCollections(collections, expandedCollectionIDs),
    [collections, expandedCollectionIDs]
  );

  return (
    <VStack w="full" h="full" spacing={1}>
      {isLoading ? (
        <CollectionsSkeleton />
      ) : isError ? (
        <>
          <Icon
            as={ExclamationCircleIcon}
            boxSize={10}
            color="red.400"
            mt={4}
            mb={2}
          />
          <Text fontSize="xl" fontWeight="bold">
            Failed to fetch feeds.
          </Text>
        </>
      ) : collections.length === 0 ? (
        <>
          <Icon
            as={InformationCircleIcon}
            boxSize={10}
            color="blue.400"
            mt={4}
            mb={2}
          />
          <Text fontSize="xl" fontWeight="bold">
            There are no feeds yet.
          </Text>
        </>
      ) : (
        <Virtuoso
          style={{ height: '100%', width: '100%' }}
          data={visibleCollections}
          computeItemKey={(_, item) => item.id}
          defaultItemHeight={40}
          increaseViewportBy={40 * 5}
          itemContent={(index) => (
            <ItemContent
              collection={visibleCollections[index]}
              activeCollectionId={activeCollectionId}
              collectionsCurrentlyUpdated={collectionsCurrentlyUpdated}
              expandedCollectionIDs={expandedCollectionIDs}
              onCollectionClicked={onCollectionClicked}
              onChevronClicked={onChevronClicked}
              onCollectionMenuActionClicked={onCollectionMenuActionClicked}
            />
          )}
        />
      )}
    </VStack>
  );
};
