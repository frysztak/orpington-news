import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { useLocalStorage } from 'usehooks-ts';
import { Panes as PanesComponent } from '@components/panes';
import { Article } from '@features/Article';
import { usePrefetchPreferences } from '@features/Preferences';
import { ReactFCC, getNumber, ClientRender } from '@utils';
import { CollectionItemsList } from './CollectionItemsList';
import { Sidebar } from './Sidebar';
import { ModalContextProvider } from './ModalContext';
import { CollectionItemsHeader } from './CollectionItemsHeader';
import { Drawer } from './Drawer';
import { AddModal } from './AddModal';
import { DeleteModal } from './DeleteModal';
import { PanesLayout, PanesLayouts } from '@components/collection/types';

interface PanesProps {
  standaloneArticle?: boolean;
}

export const Panes: ReactFCC<PanesProps> = ({
  standaloneArticle = false,
  children,
}) => {
  const router = useRouter();
  const collectionId = getNumber(router.query?.collectionId);
  const itemId = getNumber(router.query?.itemId);
  const showArticle = Boolean(collectionId) && Boolean(itemId);

  const handleGoBack = useCallback(() => {
    router.push('/');
  }, [router]);

  const [sidebarWidth, setSidebarWidth] = useLocalStorage('sidebarWidth', 300);
  const [collectionItemsWidth, setCollectionItemsWidth] = useLocalStorage(
    'collectionItemsWidth',
    400
  );
  const [collectionItemsHeight, setCollectionItemsHeight] = useLocalStorage(
    'collectionItemsHeight',
    400
  );
  const [panesLayout, setPanesLayout] = useLocalStorage<PanesLayout>(
    'panesLayout',
    PanesLayouts[0]
  );

  const layout = standaloneArticle ? 'standaloneArticle' : panesLayout;

  usePrefetchPreferences();

  return (
    <ModalContextProvider>
      <ClientRender>
        <PanesComponent
          flexGrow={1}
          sidebar={<Sidebar />}
          collectionItemHeader={
            <CollectionItemsHeader
              panesLayout={panesLayout}
              onPanesLayoutChanged={setPanesLayout}
            />
          }
          collectionItemList={
            <CollectionItemsList
              panesLayout={panesLayout}
              activeArticleId={itemId}
            />
          }
          mainContent={
            showArticle && (
              <Article
                key={itemId}
                collectionId={router.isReady ? collectionId : undefined}
                itemId={router.isReady ? itemId : undefined}
                onGoBackClicked={handleGoBack}
                isRouterReady={router.isReady}
                mobileLayout={layout === 'standaloneArticle'}
              />
            )
          }
          sidebarWidth={sidebarWidth}
          onSidebarWidthChanged={setSidebarWidth}
          collectionItemsWidth={collectionItemsWidth}
          onCollectionItemsWidthChanged={setCollectionItemsWidth}
          collectionItemsHeight={collectionItemsHeight}
          onCollectionItemsHeightChanged={setCollectionItemsHeight}
          layout={layout}
        />
      </ClientRender>

      <AddModal />
      <DeleteModal />

      <Drawer sidebar={<Sidebar />} />

      {children}
    </ModalContextProvider>
  );
};
