import { getUnixTime } from 'date-fns';
import { pool } from '@db';
import {
  DBCollection,
  setCollectionDateUpdated,
  updateCollectionETag,
} from '@db/collections';
import { insertCollectionItems } from '@db/collectionItems';
import { fetchFeed, mapFeedItems } from './parse';

export default async (collection: DBCollection) => {
  const { id: collectionId, etag, url } = collection;

  if (!url) {
    throw new Error(`Collection ${collection.id} without URL!`);
  }

  const now = getUnixTime(new Date());

  try {
    const fetchResult = await fetchFeed(url, etag);
    if (fetchResult.status === 'notModified') {
      await pool.query(setCollectionDateUpdated(collectionId, now));
      return;
    }

    const feedItems = mapFeedItems(fetchResult.data.items).map((feedItem) => ({
      ...feedItem,
      collection_id: collectionId,
      date_updated: now,
    }));

    return pool.transaction(async (con) => {
      await con.query(insertCollectionItems(feedItems));
      if (fetchResult.etag) {
        await con.query(updateCollectionETag(collectionId, fetchResult.etag));
      }
      await con.query(setCollectionDateUpdated(collectionId, now));
    });
  } catch (err) {
    throw new Error(`Updating feed '${collection.url}' failed`, {
      cause: err,
    });
  }
};
