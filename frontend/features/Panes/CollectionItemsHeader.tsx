import { useCallback, useRef } from 'react';
import { useContextSelector } from 'use-context-selector';
import { CollectionHeader, MenuAction } from '@components/collection/header';
import {
  useCollectionsContext,
  useSetCollectionPreferences,
} from '@features/Collections';
import { useActiveCollection } from '@features/Preferences';
import { CollectionPreferences } from '@shared';
import { PanesLayout } from '@components/collection/types';
import { ModalContext } from './modals';
import {
  useMarkActiveCollectionAsRead,
  useRefreshActiveCollection,
} from './hooks';

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

  const { handleRefreshClick } = useRefreshActiveCollection();
  const { handleMarkAsRead } = useMarkActiveCollectionAsRead();

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
