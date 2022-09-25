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

interface PanesProps {}

export const Panes: ReactFCC<PanesProps> = ({ children }) => {
  const router = useRouter();
  const articlePage =
    router.route === '/collection/[collectionId]/article/[itemId]';
  const collectionId = getNumber(router.query?.collectionId);
  const itemId = getNumber(router.query?.itemId);

  const handleGoBack = useCallback(() => {
    router.push('/');
  }, [router]);

  const [sidebarWidth, setSidebarWidth] = useLocalStorage('sidebarWidth', 300);
  const [collectionItemsWidth, setCollectionItemsWidth] = useLocalStorage(
    'collectionItemsWidth',
    400
  );

  usePrefetchPreferences();

  return (
    <ModalContextProvider>
      <ClientRender>
        <PanesComponent
          flexGrow={1}
          sidebar={<Sidebar />}
          collectionItemHeader={<CollectionItemsHeader />}
          collectionItemList={<CollectionItemsList />}
          mainContent={
            articlePage && (
              <Article
                key={itemId}
                collectionId={router.isReady ? collectionId : undefined}
                itemId={router.isReady ? itemId : undefined}
                onGoBackClicked={handleGoBack}
                isRouterReady={router.isReady}
              />
            )
          }
          sidebarWidth={sidebarWidth}
          onSidebarWidthChanged={setSidebarWidth}
          collectionItemsWidth={collectionItemsWidth}
          onCollectionItemsWidthChanged={setCollectionItemsWidth}
        />
      </ClientRender>

      <AddModal />
      <DeleteModal />

      <Drawer sidebar={<Sidebar />} />

      {children}
    </ModalContextProvider>
  );
};
