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
import { CollectionPreferences } from '@shared';
import { ModalContext } from './ModalContext';
import { PanesLayout } from '@components/collection/types';

export interface CollectionItemsHeaderProps {
  panesLayout?: PanesLayout;
  onPanesLayoutChanged?: (layout: PanesLayout) => void;
}

export const CollectionItemsHeader: React.FC<CollectionItemsHeaderProps> = ({
  panesLayout,
  onPanesLayoutChanged,
}) => {
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
  const handlePreferenceChange = useCallback(
    (preferences: CollectionPreferences) => {
      if (activeCollection?.id === undefined) {
        console.error(
          `handleCollectionLayoutChanged() without active collection`
        );
        return;
      }

      setCollectionPreferences({
        id: activeCollection.id,
        preferences,
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
      panesLayout={panesLayout}
      onHamburgerClicked={toggleDrawer}
      onMenuActionClicked={handleMenuActionClicked}
      onPreferenceChanged={handlePreferenceChange}
      onPanesLayoutChanged={onPanesLayoutChanged}
    />
  );
};
