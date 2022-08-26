import { getUnixTime } from 'date-fns';
import { pool } from '@db';
import { DBCollection, setCollectionDateUpdated } from '@db/collections';
import { insertCollectionItems } from '@db/collectionItems';
import { fetchFeed, mapFeedItems } from './parse';

export default (collection: DBCollection) => {
  if (!collection.url) {
    return Promise.reject(`Collection ${collection.id} without URL!`);
  }

  const collectionId = collection.id;
  const now = getUnixTime(new Date());

  return fetchFeed(collection.url)
    .then((feed) => {
      const feedItems = mapFeedItems(feed.items);
      return feedItems.map((feedItem) => ({
        ...feedItem,
        collection_id: collectionId,
        date_updated: now,
      }));
    })
    .then((feedItems) => {
      return pool.transaction(async (con) => {
        await con.query(insertCollectionItems(feedItems));
        await con.query(setCollectionDateUpdated(collectionId, now));
      });
    })
    .catch((err: Error) => {
      throw new Error(`Updating feed '${collection.url}' failed`, {
        cause: err,
      });
    });
};
