import { useCallback, useRef } from 'react';
import { useContextSelector } from 'use-context-selector';
import { CollectionHeader, MenuAction } from '@components/collection/header';
import {
  useCollectionsContext,
  useMarkCollectionAsRead,
  useRefreshCollection,
  useSetCollectionPreferences,
} from '@features/Collections';
import { useActiveCollection } from '@features/Preferences';
import {
  CollectionLayout,
  CollectionFilter,
  CollectionGrouping,
  CollectionSortBy,
} from '@orpington-news/shared';
import { ModalContext } from './ModalContext';

export const CollectionItemsHeader: React.FC = () => {
  const toggleDrawer = useContextSelector(
    ModalContext,
    (ctx) => ctx.toggleDrawer
  );

  const drawerButtonRef = useRef<HTMLButtonElement | null>(null);

  const activeCollection = useActiveCollection();
  const { currentlyUpdatedCollections, beingMarkedAsRead } =
    useCollectionsContext();

  const isRefreshing = activeCollection
    ? currentlyUpdatedCollections.set.has(activeCollection.id)
    : false;

  const { mutate: refreshCollection } = useRefreshCollection();
  const handleRefreshClick = useCallback(() => {
    if (activeCollection) {
      const collectionId = activeCollection.id;

      refreshCollection({ id: collectionId });
    } else {
      console.error(`handleRefreshClick() without active collection`);
    }
  }, [activeCollection, refreshCollection]);

  const { mutate: setCollectionPreferences } = useSetCollectionPreferences();
  // TODO: unify the three functions below
  const handleCollectionLayoutChanged = useCallback(
    (layout: CollectionLayout) => {
      if (activeCollection?.id === undefined) {
        console.error(
          `handleCollectionLayoutChanged() without active collection`
        );
        return;
      }

      setCollectionPreferences({
        id: activeCollection.id,
        preferences: { layout },
      });
    },
    [activeCollection?.id, setCollectionPreferences]
  );
  const handleCollectionFilterChanged = useCallback(
    (filter: CollectionFilter) => {
      if (activeCollection?.id === undefined) {
        console.error(
          `handleCollectionLayoutChanged() without active collection`
        );
        return;
      }

      setCollectionPreferences({
        id: activeCollection.id,
        preferences: { filter },
      });
    },
    [activeCollection?.id, setCollectionPreferences]
  );
  const handleCollectionGroupingChanged = useCallback(
    (grouping: CollectionGrouping) => {
      if (activeCollection?.id === undefined) {
        console.error(
          `handleCollectionLayoutChanged() without active collection`
        );
        return;
      }

      setCollectionPreferences({
        id: activeCollection.id,
        preferences: { grouping },
      });
    },
    [activeCollection?.id, setCollectionPreferences]
  );
  const handleCollectionSortByChanged = useCallback(
    (sortBy: CollectionSortBy) => {
      if (activeCollection?.id === undefined) {
        console.error(
          `handleCollectionLayoutChanged() without active collection`
        );
        return;
      }

      setCollectionPreferences({
        id: activeCollection.id,
        preferences: { sortBy },
      });
    },
    [activeCollection?.id, setCollectionPreferences]
  );

  const { mutate: markCollectionAsRead } = useMarkCollectionAsRead();
  const handleMarkAsRead = useCallback(() => {
    if (activeCollection) {
      markCollectionAsRead({ id: activeCollection.id });
    } else {
      console.error(`handleMarkAsRead() without active collection`);
    }
  }, [activeCollection, markCollectionAsRead]);

  const handleMenuActionClicked = useCallback(
    (action: MenuAction) => {
      switch (action) {
        case 'refresh': {
          handleRefreshClick();
          break;
        }
        case 'markAsRead': {
          handleMarkAsRead();
        }
      }
    },
    [handleMarkAsRead, handleRefreshClick]
  );

  const showBgLoadingIndicator = activeCollection
    ? beingMarkedAsRead.set.has(activeCollection.id)
    : false;

  return (
    <CollectionHeader
      collection={activeCollection}
      isRefreshing={isRefreshing || showBgLoadingIndicator}
      menuButtonRef={drawerButtonRef}
      onHamburgerClicked={toggleDrawer}
      onChangeLayout={handleCollectionLayoutChanged}
      onShowFilterChanged={handleCollectionFilterChanged}
      onGroupingChanged={handleCollectionGroupingChanged}
      onSortByChanged={handleCollectionSortByChanged}
      onMenuActionClicked={handleMenuActionClicked}
    />
  );
};
