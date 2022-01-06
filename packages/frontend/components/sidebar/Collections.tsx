import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, MenuDivider, MenuItem, VStack } from '@chakra-ui/react';
import { CgRemove } from 'react-icons/cg';
import { IoCheckmarkDone, IoRefresh } from 'react-icons/io5';
import { AiTwotoneEdit } from 'react-icons/ai';
import { SidebarItem } from './SidebarItem';
import { getCollectionIcon } from './CollectionIcon';
import { ID, Collection } from '@orpington-news/shared';

export type CollectionMenuAction = 'markAsRead' | 'refresh' | 'edit' | 'delete';

export interface CollapsibleCollectionListProps {
  collection: Collection;
  activeCollectionId?: ID;
  expandedCollectionIDs?: Array<ID>;

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
  collections: Collection[];
  activeCollectionId?: ID;
  expandedCollectionIDs?: Array<ID>;

  onCollectionClicked: (collection: Collection) => void;
  onChevronClicked: (collection: Collection) => void;
  onCollectionMenuActionClicked?: (
    collection: Collection,
    action: CollectionMenuAction
  ) => void;
}

export const Collections: React.FC<CollectionsProps> = (props) => {
  const {
    collections,
    activeCollectionId,
    expandedCollectionIDs,
    onCollectionClicked,
    onChevronClicked,
    onCollectionMenuActionClicked,
  } = props;

  return (
    <VStack w="full" spacing={1}>
      {collections.map((collection: Collection) => (
        <CollapsibleCollectionList
          key={collection.id}
          collection={collection}
          activeCollectionId={activeCollectionId}
          expandedCollectionIDs={expandedCollectionIDs}
          onCollectionClicked={onCollectionClicked}
          onChevronClicked={onChevronClicked}
          onCollectionMenuActionClicked={onCollectionMenuActionClicked}
        />
      ))}
    </VStack>
  );
};

const useExpandedCollections = (initialExpandedCollectionIDs?: Array<ID>) => {
  const [expandedCollectionIDs, setExpandedCollectionIDs] = useState(
    initialExpandedCollectionIDs || []
  );

  const onToggleCollection = useCallback((collection: Collection) => {
    setExpandedCollectionIDs((collections) => {
      const idx = collections.findIndex((id) => id === collection.id);
      return idx !== -1
        ? [...collections.slice(0, idx), ...collections.slice(idx + 1)]
        : [...collections, collection.id];
    });
  }, []);

  return { expandedCollectionIDs, onToggleCollection };
};

const useActiveCollection = (initialActiveCollectionId?: ID) => {
  const [activeCollectionId, setActiveCollectionID] = useState(
    initialActiveCollectionId
  );

  const onClickCollection = useCallback((collection: Collection) => {
    setActiveCollectionID(collection.id);
  }, []);

  return { activeCollectionId, onClickCollection };
};
