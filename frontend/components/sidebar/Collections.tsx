import React, { useCallback, useMemo } from 'react';
import { Icon, Text, VStack } from '@chakra-ui/react';
import {
  ExclamationCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/solid';
import { Virtuoso } from 'react-virtuoso';
import { ID, Collection } from '@shared';
import { CollectionMenuAction, SidebarItem } from './SidebarItem';
import { getCollectionIcon } from './CollectionIcon';
import { CollectionsSkeleton } from './CollectionsSkeleton';
import { filterVisibleCollections } from './filterVisibleCollections';

interface ItemContentProps {
  collection: Collection;

  activeCollectionId?: ID;
  expandedCollectionIDs?: Array<ID>;
  collectionsCurrentlyUpdated?: Set<ID>;

  onCollectionClicked: (collection: Collection) => void;
  onChevronClicked: (collection: Collection) => void;
  onCollectionMenuActionClicked: (
    collection: Collection,
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
    (action: CollectionMenuAction) => {
      onCollectionMenuActionClicked(collection, action);
    },
    [collection, onCollectionMenuActionClicked]
  );

  return (
    <SidebarItem
      title={title}
      isActive={activeCollectionId === id}
      icon={icon}
      // subtract one because we're not showing home collection
      level={level - 1}
      counter={unreadCount}
      isLoading={collectionsCurrentlyUpdated?.has(id) ?? false}
      chevron={hasChildren ? (isOpen ? 'bottom' : 'top') : undefined}
      onClick={handleClick}
      onChevronClick={handleChevronClick}
      onMenuActionClicked={handleMenuItemClick}
      data-test={`collection-id-${id}`}
    />
  );
};

export interface CollectionsProps {
  isLoading?: boolean;
  isError?: boolean;
  collections: Collection[];
  activeCollectionId?: ID;
  homeCollectionId?: ID;
  expandedCollectionIDs?: Array<ID>;
  collectionsCurrentlyUpdated?: Set<ID>;

  onCollectionClicked: (collection: Collection) => void;
  onChevronClicked: (collection: Collection) => void;
  onCollectionMenuActionClicked: (
    collection: Collection,
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
      ) : // don't count Home collection
      collections.length <= 1 ? (
        <>
          <Icon
            as={InformationCircleIcon}
            boxSize={10}
            color="blue.400"
            mt={4}
            mb={2}
          />
          <Text fontSize="xl" fontWeight="bold" data-test="thereAreNoFeedsYet">
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
