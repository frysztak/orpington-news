import { useEffect } from 'react';
import { useQueryClient } from 'react-query';
import { sseUrl } from '@api';
import { Msg } from '@orpington-news/shared';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useActiveCollectionContext } from '@features/ActiveCollection';
import { collectionKeys } from '@features';

export const SSEListener: React.FC = ({ children }) => {
  const queryClient = useQueryClient();
  const { addCurrentlyUpdatedCollection, deleteCurrentlyUpdatedCollection } =
    useActiveCollectionContext();

  useEffect(() => {
    const fetchData = async () => {
      await fetchEventSource(sseUrl, {
        openWhenHidden: true,
        onmessage(ev) {
          if (ev.data) {
            const msg: Msg = JSON.parse(ev.data);
            console.log(msg);
            switch (msg.type) {
              case 'updatingFeeds': {
                return addCurrentlyUpdatedCollection(msg.data.feedIds);
              }
              case 'updatedFeeds': {
                for (const feedId of msg.data.feedIds) {
                  queryClient.invalidateQueries(collectionKeys.list(feedId));
                }
                queryClient.invalidateQueries(collectionKeys.tree);
                return deleteCurrentlyUpdatedCollection(msg.data.feedIds);
              }
            }
          }
        },
      });
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
};
