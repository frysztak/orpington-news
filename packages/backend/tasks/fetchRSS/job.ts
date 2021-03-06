import { AsyncTask, SimpleIntervalJob } from 'toad-scheduler';
import { getUnixTime } from 'date-fns';
import { pool } from '@db';
import {
  DBCollection,
  getCollectionsToRefresh,
  setCollectionDateUpdated,
} from '@db/collections';
import { fetchFeed, mapFeedItems } from './parse';
import { logger } from '@utils/logger';
import { insertCollectionItems } from '@db/collectionItems';
import {
  isRejected,
  makeUpdatedFeedsMsg,
  makeUpdatingFeedsMsg,
} from '@orpington-news/shared';
import { sseEmit } from '@sse';

export const updateCollections = (collections: readonly DBCollection[]) => {
  logger.info(`Found ${collections.length} feeds to update...`);
  if (collections.length) {
    sseEmit(
      makeUpdatingFeedsMsg({
        feedIds: collections.map((c) => c.id),
      })
    );
  }

  return Promise.allSettled(collections.map(fetchAndInsertCollection)).then(
    (results) => {
      const failures = results.filter(isRejected);
      if (failures.length === 0) {
        logger.info(`Feeds updated successfully!`);
        return true;
      } else {
        logger.info(`Feed updated, but with following errors:`);
        for (const failure of failures) {
          // TODO: we should probably somehow inform user about that
          logger.error(failure.reason);
        }
        return false;
      }
    }
  );
};

const fetchAndInsertCollection = (collection: DBCollection) => {
  if (!collection.url) {
    return Promise.reject(`Collection ${collection.id} without URL!`);
  }

  const collection_id = collection.id;
  const now = getUnixTime(new Date());

  return fetchFeed(collection.url)
    .then((feed) => {
      const feedItems = mapFeedItems(feed.items);
      return feedItems.map((feedItem) => ({
        ...feedItem,
        collection_id,
        date_updated: now,
      }));
    })
    .then((feedItems) => {
      return pool
        .transaction(async (con) => {
          await con.query(insertCollectionItems(feedItems));
          await con.query(setCollectionDateUpdated(collection_id, now));
        })
        .then(() => {
          sseEmit(makeUpdatedFeedsMsg({ feedIds: [collection_id] }));
        });
    })
    .finally(() => {
      sseEmit(makeUpdatedFeedsMsg({ feedIds: [collection_id] }));
    });
};

const task = new AsyncTask(
  'fetchRSS',
  () => {
    logger.info(`Starting to update feeds...`);
    return pool
      .any(getCollectionsToRefresh())
      .then(updateCollections)
      .then(() => void 0);
  },
  (err: Error) => {
    logger.error(err);
  }
);

export const fetchRSSJob = new SimpleIntervalJob(
  { minutes: 5, runImmediately: true },
  task
);
