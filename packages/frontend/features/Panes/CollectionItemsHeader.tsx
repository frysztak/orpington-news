import { useCallback, useRef } from 'react';
import { useContextSelector } from 'use-context-selector';
import { CollectionHeader, MenuAction } from '@components/collection/header';
import {
  useCollectionsContext,
  useMarkCollectionAsRead,
  useRefreshCollection,
  useSetCollectionLayout,
} from '@features/Collections';
import { useActiveCollection } from '@features/Preferences';
import { CollectionLayout } from '@orpington-news/shared';
import { ModalContext } from './ModalContext';

export const CollectionItemsHeader: React.FC = () => {
  const toggleDrawer = useContextSelector(
    ModalContext,
    (ctx) => ctx.toggleDrawer
  );

  const drawerButtonRef = useRef<HTMLButtonElement | null>(null);

  const activeCollection = useActiveCollection();
  const { currentlyUpdatedCollections } = useCollectionsContext();

  const isRefreshing =
    activeCollection && typeof activeCollection.id === 'number'
      ? currentlyUpdatedCollections.has(activeCollection.id)
      : false;

  const { mutate: refreshCollection } = useRefreshCollection();
  const handleRefreshClick = useCallback(() => {
    if (activeCollection) {
      const collectionId = activeCollection.id;
      if (typeof collectionId === 'string' && collectionId !== 'home') {
        return;
      }

      refreshCollection({ id: collectionId });
    } else {
      console.error(`handleRefreshClick() without active collection`);
    }
  }, [activeCollection, refreshCollection]);

  const { mutate: setCollectionLayout } = useSetCollectionLayout();
  const handleCollectionLayoutChanged = useCallback(
    (layout: CollectionLayout) => {
      if (activeCollection?.id === undefined) {
        console.error(
          `handleCollectionLayoutChanged() without active collection`
        );
        return;
      }

      setCollectionLayout({
        id: activeCollection.id,
        layout,
      });
    },
    [activeCollection?.id, setCollectionLayout]
  );

  const { mutate: markCollectionAsRead } = useMarkCollectionAsRead();
  const handleMarkAsRead = useCallback(() => {
    if (activeCollection) {
      const collectionId = activeCollection.id;
      if (typeof collectionId === 'string' && collectionId === 'home') {
        return;
      }

      markCollectionAsRead({ id: collectionId });
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

  return (
    <CollectionHeader
      collection={activeCollection}
      isRefreshing={isRefreshing}
      menuButtonRef={drawerButtonRef}
      onHamburgerClicked={toggleDrawer}
      onChangeLayout={handleCollectionLayoutChanged}
      onMenuActionClicked={handleMenuActionClicked}
    />
  );
};
