import React, { useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useToast } from '@chakra-ui/react';
import type { Workbox, WorkboxLifecycleWaitingEvent } from 'workbox-window';
import { NewVersionToast } from '@components/toast';
import { noop } from '@orpington-news/shared';

declare global {
  interface Window {
    workbox?: Workbox;
  }
}

const Home: NextPage = () => {
  const toast = useToast();
  const toastId = 'newVersionToast';

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      window.workbox !== undefined
    ) {
      const wb = window.workbox;

      const promptNewVersionAvailable = (
        event: WorkboxLifecycleWaitingEvent
      ) => {
        // `event.wasWaitingBeforeRegister` will be false if this is the first time the updated service worker is waiting.
        // When `event.wasWaitingBeforeRegister` is true, a previously updated service worker is still waiting.
        // You may want to customize the UI prompt accordingly.

        if (!toast.isActive(toastId)) {
          toast({
            id: toastId,
            position: 'bottom-left',
            render: ({ id, onClose }) => (
              <NewVersionToast
                id={id}
                onClose={onClose}
                isReloading={false}
                onReload={() => {
                  wb.addEventListener('controlling', (event) => {
                    window.location.reload();
                  });

                  // Send a message to the waiting service worker, instructing it to activate.
                  wb.messageSkipWaiting();

                  toast.update(toastId, {
                    position: 'bottom-left',
                    render: ({ id, onClose }) => (
                      <NewVersionToast
                        id={id}
                        onClose={onClose}
                        isReloading
                        onReload={noop}
                      />
                    ),
                  });
                }}
              />
            ),
          });
        }
      };

      wb.addEventListener('waiting', promptNewVersionAvailable);

      // never forget to call register as auto register is turned off in next.config.js
      wb.register();
    }
  }, [toast]);

  return (
    <>
      <Head>
        <title>Orpington News</title>
      </Head>
    </>
  );
};

export default Home;
