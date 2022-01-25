import React, { useCallback, useMemo } from 'react';
import {
  Box,
  Icon,
  MenuDivider,
  Text,
  MenuItem,
  VStack,
} from '@chakra-ui/react';
import { CgRemove } from '@react-icons/all-files/cg/CgRemove';
import { IoRefresh } from '@react-icons/all-files/io5/IoRefresh';
import { IoCheckmarkDone } from '@react-icons/all-files/io5/IoCheckmarkDone';
import { AiTwotoneEdit } from '@react-icons/all-files/ai/AiTwotoneEdit';
import { BiMessageAltError } from '@react-icons/all-files/bi/BiMessageAltError';
import { SidebarItem } from './SidebarItem';
import { getCollectionIcon } from './CollectionIcon';
import { ID, Collection } from '@orpington-news/shared';

export type CollectionMenuAction = 'markAsRead' | 'refresh' | 'edit' | 'delete';

export interface CollapsibleCollectionListProps {
  collection: Collection;
  activeCollectionId?: ID;
  expandedCollectionIDs?: Array<ID>;
  collectionsCurrentlyUpdated?: Set<ID>;

  onCollectionClicked: (collection: Collection) => void;
  onChevronClicked: (collection: Collection) => void;
  onCollectionMenuActionClicked?: (
    collection: Collection,
    action: CollectionMenuAction
  ) => void;
}

const CollapsibleCollectionList: React.FC<CollapsibleCollectionListProps> = (
  props
) => {
  const {
    collection,
    activeCollectionId,
    expandedCollectionIDs,
    collectionsCurrentlyUpdated,
    onCollectionClicked,
    onChevronClicked,
    onCollectionMenuActionClicked,
  } = props;
  const { id, title, unreadCount, children } = collection;

  const hasChildren = Boolean(children) && children?.length !== 0;
  const isOpen = expandedCollectionIDs?.includes(id) ?? false;

  const handleChevronClick = (collection: Collection) => () =>
    onChevronClicked(collection);
  const handleClick = () => onCollectionClicked(collection);

  const icon = useMemo(
    () => getCollectionIcon(collection.icon),
    [collection.icon]
  );

  const handleMenuItemClick = useCallback(
    (action: CollectionMenuAction) => () => {
      onCollectionMenuActionClicked?.(collection, action);
    },
    [collection, onCollectionMenuActionClicked]
  );

  return (
    <>
      <SidebarItem
        title={title}
        isActive={activeCollectionId === id}
        icon={icon}
        counter={unreadCount}
        isLoading={collectionsCurrentlyUpdated?.has(id) ?? false}
        chevron={hasChildren ? (isOpen ? 'bottom' : 'top') : undefined}
        onClick={handleClick}
        onChevronClick={handleChevronClick(collection)}
        menuItems={
          <>
            <MenuItem
              icon={<IoCheckmarkDone />}
              onClick={handleMenuItemClick('markAsRead')}
            >
              Mark as read
            </MenuItem>
            <MenuItem
              icon={<IoRefresh />}
              onClick={handleMenuItemClick('refresh')}
            >
              Refresh
            </MenuItem>
            <MenuItem
              icon={<AiTwotoneEdit />}
              onClick={handleMenuItemClick('edit')}
            >
              Edit
            </MenuItem>
            <MenuDivider />
            <MenuItem
              icon={<CgRemove />}
              onClick={handleMenuItemClick('delete')}
            >
              Delete
            </MenuItem>
          </>
        }
      />
      <Box pl={4} w="full">
        {isOpen &&
          children?.map((collection: Collection) => (
            <CollapsibleCollectionList
              key={collection.id}
              collection={collection}
              activeCollectionId={activeCollectionId}
              expandedCollectionIDs={expandedCollectionIDs}
              collectionsCurrentlyUpdated={collectionsCurrentlyUpdated}
              onCollectionClicked={onCollectionClicked}
              onChevronClicked={handleChevronClick(collection)}
              onCollectionMenuActionClicked={onCollectionMenuActionClicked}
            />
          ))}
      </Box>
    </>
  );
};

export interface CollectionsProps {
  isError?: boolean;
  collections: Collection[];
  activeCollectionId?: ID;
  expandedCollectionIDs?: Array<ID>;
  collectionsCurrentlyUpdated?: Set<ID>;

  onCollectionClicked: (collection: Collection) => void;
  onChevronClicked: (collection: Collection) => void;
  onCollectionMenuActionClicked?: (
    collection: Collection,
    action: CollectionMenuAction
  ) => void;
}

export const Collections: React.FC<CollectionsProps> = (props) => {
  const {
    isError = false,
    collections,
    activeCollectionId,
    expandedCollectionIDs,
    collectionsCurrentlyUpdated,
    onCollectionClicked,
    onChevronClicked,
    onCollectionMenuActionClicked,
  } = props;

  return (
    <VStack w="full" spacing={1}>
      {isError ? (
        <>
          <Icon
            as={BiMessageAltError}
            boxSize={10}
            color="red.400"
            mt={4}
            mb={2}
          />
          <Text fontSize="xl" fontWeight="bold">
            Failed to fetch collections
          </Text>
        </>
      ) : (
        collections.map((collection: Collection) => (
          <CollapsibleCollectionList
            key={collection.id}
            collection={collection}
            activeCollectionId={activeCollectionId}
            expandedCollectionIDs={expandedCollectionIDs}
            collectionsCurrentlyUpdated={collectionsCurrentlyUpdated}
            onCollectionClicked={onCollectionClicked}
            onChevronClicked={onChevronClicked}
            onCollectionMenuActionClicked={onCollectionMenuActionClicked}
          />
        ))
      )}
    </VStack>
  );
};
